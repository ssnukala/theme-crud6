<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCRUD6Schema } from '@ssnukala/sprinkle-crud6/composables'
import CRUD6CreateModal from '../../components/Pages/CRUD6/Base/CreateModal.vue'
import CRUD6EditModal from '../../components/Pages/CRUD6/Base/EditModal.vue'
import CRUD6DeleteModal from '../../components/Pages/CRUD6/Base/DeleteModal.vue'
import type { CRUD6Interface } from '@ssnukala/sprinkle-crud6/interfaces'

const route = useRoute()
const router = useRouter()

// Get model from route parameter
const model = computed(() => route.params.model as string)

// Use schema composable for dynamic schema loading
const {
    schema,
    loading: schemaLoading,
    error: schemaError,
    loadSchema,
    hasPermission,
    tableColumns,
    defaultSort
} = useCRUD6Schema()

// Permission checks
const hasCreatePermission = computed(() => hasPermission('create'))
const hasEditPermission = computed(() => hasPermission('update'))
const hasDeletePermission = computed(() => hasPermission('delete'))

// Dynamic API URL based on model
const apiUrl = computed(() => model.value ? `/api/crud6/${model.value}` : '/api/groups')

// Dynamic search column from schema or fallback
const searchColumn = computed(() => {
    if (schema.value?.fields) {
        // Find first searchable field or fallback to 'name'
        const searchableField = Object.keys(schema.value.fields).find(key => 
            schema.value.fields[key].searchable
        )
        return searchableField || 'name'
    }
    return 'name'
})

// Actions
function createNew() {
    if (model.value) {
        router.push(`/crud6/${model.value}/create`)
    }
}

function editRecord(record: CRUD6Interface) {
    if (model.value && record) {
        const id = record[schema.value?.primary_key || 'id']
        router.push(`/crud6/${model.value}/${id}/edit`)
    }
}

function viewRecord(record: CRUD6Interface) {
    if (model.value && record) {
        const id = record[schema.value?.primary_key || 'id']
        router.push(`/crud6/${model.value}/${id}`)
    }
}

function deleteRecord(record: CRUD6Interface) {
    // Delete functionality handled by CRUD6DeleteModal component
    console.log('Delete record:', record)
}

// Load schema when component mounts or model changes
onMounted(() => {
    if (model.value) {
        loadSchema(model.value).then(() => {
            console.log('PageList.vue: Schema loaded for model', model.value, ':', schema.value)
            console.log('PageList.vue: Schema fields:', schema.value?.fields)
            console.log('PageList.vue: Fields entries:', Object.entries(schema.value?.fields || {}))
            
            // Debug each field's listable property
            Object.entries(schema.value?.fields || {}).forEach(([fieldKey, field]) => {
                console.log(`Field ${fieldKey}:`, field, `listable: ${field.listable}`)
            })
        })
    }
})
</script>

<template>
    <UFCardBox>
        <!-- Loading state -->
        <div v-if="schemaLoading" class="uk-text-center uk-padding">
            <div uk-spinner></div>
            <p>{{ $t('LOADING') }}</p>
        </div>
        
        <!-- Error state -->
        <div v-else-if="schemaError" class="uk-alert-danger" uk-alert>
            <h4>{{ schemaError.title }}</h4>
            <p>{{ schemaError.description }}</p>
        </div>
        
        <!-- Dynamic Table with Schema -->
        <UFSprunjeTable 
            v-else-if="schema" 
            :dataUrl="apiUrl" 
            :searchColumn="searchColumn">
            <!-- print the schema in the console log -->
            <template #actions="{ sprunjer }">
                <CRUD6CreateModal
                    @saved="sprunjer.fetch()"
                    class="uk-button uk-button-primary"
                    v-if="hasCreatePermission" />
            </template>

            <template #header>
                <!-- Dynamic headers based on schema -->
                <UFSprunjeHeader 
                    v-for="[fieldKey, field] in Object.entries(schema?.fields || {})"
                    :key="fieldKey"
                    v-if="field"
                    :sort="fieldKey"
                    :class="field.width ? `uk-width-${field.width}` : ''">
                    {{ field.label || fieldKey }}
                </UFSprunjeHeader>
                <UFSprunjeHeader v-if="hasEditPermission || hasDeletePermission">
                    {{ $t('CRUD6.ACTIONS') }}
                </UFSprunjeHeader>
            </template>

            <template #body="{ row, sprunjer }">
                <!-- Dynamic columns based on schema -->
                <UFSprunjeColumn 
                    v-for="[fieldKey, field] in Object.entries(schema?.fields || {})"
                    :key="fieldKey"
                    v-if="field"
                    :class="field.width ? `uk-width-${field.width}` : ''">
                    <template v-if="field.type === 'link' || fieldKey === schema?.primary_key">
                        <strong>
                            <RouterLink
                                :to="{
                                    name: 'crud6.view',
                                    params: { 
                                        model: model,
                                        id: row[schema?.primary_key || 'id'] 
                                    }
                                }"
                                @click="viewRecord(row)">
                                {{ row[fieldKey] }}
                            </RouterLink>
                        </strong>
                    </template>
                    <template v-else-if="field.type === 'badge'">
                        <span class="uk-badge">{{ row[fieldKey] }}</span>
                    </template>
                    <template v-else-if="field.type === 'boolean'">
                        <span :class="row[fieldKey] ? 'uk-text-success' : 'uk-text-danger'">
                            {{ row[fieldKey] ? $t('YES') : $t('NO') }}
                        </span>
                    </template>
                    <template v-else>
                        {{ row[fieldKey] }}
                    </template>
                </UFSprunjeColumn>
                
                <!-- Actions column -->
                <UFSprunjeColumn v-if="hasEditPermission || hasDeletePermission">
                    <button class="uk-button uk-button-primary uk-text-nowrap" type="button">
                        {{ $t('ACTIONS') }} <span uk-drop-parent-icon></span>
                    </button>
                    <div
                        class="uk-padding-small"
                        uk-dropdown="pos: bottom-right; mode: click; offset: 2">
                        <ul class="uk-nav uk-dropdown-nav">
                            <li>
                                <RouterLink
                                    :to="{
                                        name: 'crud6.view',
                                        params: { 
                                            model: model,
                                            id: row[schema?.primary_key || 'id'] 
                                        }
                                    }"
                                    @click="viewRecord(row)">
                                    <font-awesome-icon icon="eye" fixed-width /> View
                                </RouterLink>
                            </li>
                            <li v-if="hasEditPermission">
                                <CRUD6EditModal
                                    :crud6="row"
                                    @saved="sprunjer.fetch()"
                                    class="uk-drop-close" />
                            </li>
                            <li v-if="hasDeletePermission">
                                <CRUD6DeleteModal
                                    :crud6="row"
                                    @deleted="sprunjer.fetch()"
                                    class="uk-drop-close" />
                            </li>
                        </ul>
                    </div>
                </UFSprunjeColumn>
            </template>
        </UFSprunjeTable>
        
        <!-- Fallback for no schema -->
        <div v-else class="uk-alert-warning" uk-alert>
            <p>{{ $t('CRUD6.NO_SCHEMA') }}</p>
        </div>
    </UFCardBox>
</template>
