<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageMeta } from '@userfrosting/sprinkle-core/stores'
import { useCRUD6Api } from '@ssnukala/sprinkle-crud6/composables'
import { useCRUD6Schema } from '@ssnukala/sprinkle-crud6/composables'
import CRUD6Info from '../../components/Pages/CRUD6/Base/Info.vue'
import CRUD6Users from '../../components/Pages/CRUD6/Base/Users.vue'
import type { CRUD6Response, CRUD6Interface } from '@ssnukala/sprinkle-crud6/interfaces'

/**
 * Variables and composables
 */
const route = useRoute()
const router = useRouter()
const page = usePageMeta()

// Get model and ID from route parameters
const model = computed(() => route.params.model as string)
const recordId = computed(() => route.params.id as string)
const isCreateMode = computed(() => route.name === 'crud6-create')
const isEditMode = ref(isCreateMode.value)

// Use composables for schema and API
const {
    schema,
    loading: schemaLoading,
    error: schemaError,
    loadSchema,
    hasPermission
} = useCRUD6Schema()

const {
    fetchCRUD6,
    fetchCRUD6Row,
    createCRUD6,
    updateCRUD6,
    apiLoading,
    apiError,
    formData,
    resetForm
} = useCRUD6Api()

// Use the schema to set the initial response structure
const CRUD6Row = ref<CRUD6Response>({
    id: 0,
    name: '',
    slug: '',
    description: '',
    icon: '',
    created_at: '',
    updated_at: '',
    deleted_at: null,
    users_count: 0
})

// Reactive state for record management
const record = ref<CRUD6Interface | null>(null)
const originalRecord = ref<CRUD6Interface | null>(null)

// Combined loading and error states
const loading = computed(() => schemaLoading.value || apiLoading.value)
const error = computed(() => schemaError.value || apiError.value)

// Permission checks
const hasEditPermission = computed(() => hasPermission('update'))
const hasCreatePermission = computed(() => hasPermission('create'))
const hasViewPermission = computed(() => hasPermission('view'))

/**
 * Methods - Fetch record
 */
function fetch() {
    if (recordId.value && fetchCRUD6Row) {
        const fetchPromise = fetchCRUD6Row(recordId.value)
        if (fetchPromise && typeof fetchPromise.then === 'function') {
            fetchPromise.then((fetchedRow) => {
                CRUD6Row.value = fetchedRow.data
                record.value = fetchedRow.data
                originalRecord.value = { ...fetchedRow.data }
                page.title = CRUD6Row.value.name
            }).catch((error) => {
                console.error('Failed to fetch CRUD6 row:', error)
            })
        }
    }
}

// Actions for form management
function goBack() {
    router.push(`/crud6/${model.value}`)
}

function toggleEditMode() {
    isEditMode.value = true
    // Store original record for cancel functionality
    originalRecord.value = { ...record.value }
}

function cancelEdit() {
    if (originalRecord.value) {
        record.value = { ...originalRecord.value }
        CRUD6Row.value = { ...originalRecord.value } as CRUD6Response
    }
    isEditMode.value = false
}

async function saveRecord() {
    if (!record.value) return

    try {
        if (isCreateMode.value) {
            await createCRUD6(record.value)
            router.push(`/crud6/${model.value}`)
        } else {
            await updateCRUD6(recordId.value, record.value)
            isEditMode.value = false
            originalRecord.value = { ...record.value }
            CRUD6Row.value = { ...record.value } as CRUD6Response
            // Refresh the data
            fetch()
        }
    } catch (error) {
        console.error('Save failed:', error)
    }
}

// Utility function to format field values for display
function formatFieldValue(value: any, field: any): string {
    if (value === null || value === undefined) return ''
    
    switch (field.type) {
        case 'boolean':
            return value ? 'Yes' : 'No'
        case 'date':
        case 'datetime':
            return new Date(value).toLocaleDateString()
        case 'json':
            return JSON.stringify(value, null, 2)
        default:
            return String(value)
    }
}

// Load data when component mounts
onMounted(async () => {
    if (model.value) {
        // Only load schema if not already loaded
        if (!schema.value && loadSchema) {
            await loadSchema(model.value)
        }
        
        if (!isCreateMode.value && recordId.value) {
            fetch()
        } else if (isCreateMode.value) {
            // Initialize empty record for create mode
            record.value = {}
            CRUD6Row.value = {
                id: 0,
                name: '',
                slug: '',
                description: '',
                icon: '',
                created_at: '',
                updated_at: '',
                deleted_at: null,
                users_count: 0
            }
            resetForm()
        }
    }
})

/**
 * Watcher - Update page on id change
 */
watch(
    () => route.params.id,
    () => {
        if (!isCreateMode.value) {
            fetch()
        }
    },
    { immediate: false }
)

// Watch for route changes
watch([model, recordId], async ([newModel, newId]) => {
    if (newModel && loadSchema) {
        try {
            // Only load schema if not already loaded for this model
            if (!schema.value || schema.value?.model !== newModel) {
                const schemaPromise = loadSchema(newModel)
                if (schemaPromise && typeof schemaPromise.then === 'function') {
                    await schemaPromise
                }
            }
            
            if (newId && !isCreateMode.value) {
                fetch()
            }
        } catch (error) {
            console.error('Failed to load schema in route watcher:', error)
        }
    }
})
</script>

<template>
    <template v-if="error">
        <UFErrorPage :errorCode="error.status || 500" />
    </template>
    <template v-else-if="loading">
        <div class="uk-text-center uk-padding">
            <div uk-spinner></div>
            <p>{{ $t('LOADING') }}</p>
        </div>
    </template>
    <template v-else>
        <!-- Schema-driven edit/create mode -->
        <div v-if="isEditMode && schema" class="uk-container">
            <div class="uk-card uk-card-default">
                <div class="uk-card-header">
                    <div class="uk-flex uk-flex-between uk-flex-middle">
                        <div>
                            <h3 class="uk-card-title uk-margin-remove">
                                {{ isCreateMode ? $t('CREATE') : $t('EDIT') }} {{ schema?.title || model }}
                            </h3>
                            <small v-if="recordId" class="uk-text-muted">ID: {{ recordId }}</small>
                        </div>
                        <div>
                            <button
                                type="button"
                                class="uk-button uk-button-default"
                                @click="goBack">
                                <font-awesome-icon icon="arrow-left" /> Back
                            </button>
                            <button
                                type="button"
                                class="uk-button uk-button-primary"
                                @click="saveRecord"
                                :disabled="loading">
                                <font-awesome-icon icon="save" /> Save
                            </button>
                            <button
                                v-if="!isCreateMode"
                                type="button"
                                class="uk-button uk-button-secondary"
                                @click="cancelEdit">
                                <font-awesome-icon icon="times" /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
                <div class="uk-card-body">
                    <!-- Dynamic Form based on schema -->
                    <form v-if="schema && record" @submit.prevent="saveRecord" class="uk-form-stacked">
                        <div class="uk-grid-small" uk-grid>
                            <div
                                v-for="[fieldKey, field] in Object.entries(schema.fields)"
                                :key="fieldKey"
                                :class="field.width || 'uk-width-1-2'"
                                v-if="field.editable !== false">
                                
                                <label :for="fieldKey" class="uk-form-label">
                                    {{ field.label || fieldKey }}
                                    <span v-if="field.required" class="uk-text-danger">*</span>
                                </label>
                                
                                <!-- Text input -->
                                <input
                                    v-if="field.type === 'string' || !field.type"
                                    :id="fieldKey"
                                    v-model="record[fieldKey]"
                                    type="text"
                                    class="uk-input"
                                    :required="field.required"
                                    :placeholder="field.placeholder"
                                />
                                
                                <!-- Number input -->
                                <input
                                    v-else-if="['integer', 'decimal', 'float'].includes(field.type)"
                                    :id="fieldKey"
                                    v-model="record[fieldKey]"
                                    type="number"
                                    class="uk-input"
                                    :required="field.required"
                                    :step="field.type === 'integer' ? '1' : 'any'"
                                />
                                
                                <!-- Boolean checkbox -->
                                <label v-else-if="field.type === 'boolean'" class="uk-form-label">
                                    <input
                                        :id="fieldKey"
                                        v-model="record[fieldKey]"
                                        type="checkbox"
                                        class="uk-checkbox"
                                    />
                                    {{ field.label || fieldKey }}
                                </label>
                                
                                <!-- Date input -->
                                <input
                                    v-else-if="field.type === 'date'"
                                    :id="fieldKey"
                                    v-model="record[fieldKey]"
                                    type="date"
                                    class="uk-input"
                                    :required="field.required"
                                />
                                
                                <!-- DateTime input -->
                                <input
                                    v-else-if="field.type === 'datetime'"
                                    :id="fieldKey"
                                    v-model="record[fieldKey]"
                                    type="datetime-local"
                                    class="uk-input"
                                    :required="field.required"
                                />
                                
                                <!-- Text area -->
                                <textarea
                                    v-else-if="field.type === 'text'"
                                    :id="fieldKey"
                                    v-model="record[fieldKey]"
                                    class="uk-textarea"
                                    :rows="field.rows || 3"
                                    :required="field.required"
                                    :placeholder="field.placeholder"
                                ></textarea>
                                
                                <!-- JSON field -->
                                <textarea
                                    v-else-if="field.type === 'json'"
                                    :id="fieldKey"
                                    v-model="record[fieldKey]"
                                    class="uk-textarea"
                                    :rows="field.rows || 5"
                                    placeholder="Enter valid JSON"
                                ></textarea>
                                
                                <!-- Default text input -->
                                <input
                                    v-else
                                    :id="fieldKey"
                                    v-model="record[fieldKey]"
                                    type="text"
                                    class="uk-input"
                                    :required="field.required"
                                />
                                
                                <small v-if="field.description" class="uk-text-muted">
                                    {{ field.description }}
                                </small>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- Default view mode with existing components -->
        <div v-else class="uk-child-width-expand" uk-grid>
            <div>
                <CRUD6Info :crud6="CRUD6Row" :schema="schema" @crud6Updated="fetch()" />
                <!-- Add edit button if user has permission -->
                <div v-if="hasEditPermission && !isCreateMode" class="uk-margin-top">
                    <button 
                        @click="toggleEditMode"
                        class="uk-button uk-button-primary uk-width-1-1">
                        <font-awesome-icon icon="edit" /> {{ $t('EDIT') }}
                    </button>
                </div>
            </div>
            <div class="uk-width-2-3" v-if="$checkAccess('view_crud6_field')">
                <CRUD6Users :slug="$route.params.id" />
            </div>
        </div>
    </template>
</template>
