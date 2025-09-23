<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCRUD6Schema } from '../../../../composables'
import type { CRUD6Response } from '@ssnukala/sprinkle-crud6/interfaces'
import CRUD6EditModal from './EditModal.vue'
import CRUD6DeleteModal from './DeleteModal.vue'

const route = useRoute()
const router = useRouter()

const { crud6 } = defineProps<{
    crud6: CRUD6Response
}>()

const emits = defineEmits(['crud6Updated'])

// Get model from route parameter for schema loading
const model = computed(() => route.params.model as string)

// Use schema composable for dynamic display
const {
    schema,
    loading: schemaLoading,
    error: schemaError,
    loadSchema,
    hasPermission
} = useCRUD6Schema()

// Permission checks using schema-driven permissions
const hasUpdatePermission = computed(() => hasPermission('update'))
const hasDeletePermission = computed(() => hasPermission('delete'))
const hasViewFieldPermission = computed(() => hasPermission('view_field'))

// Computed properties for dynamic display
const displayFields = computed(() => {
    if (!schema.value?.fields) return {}
    return Object.fromEntries(
        Object.entries(schema.value.fields).filter(([key, field]) => 
            field.displayable !== false && key !== 'icon'
        )
    )
})

const iconField = computed(() => {
    if (!schema.value?.fields) return null
    return schema.value.fields.icon || null
})

// Helper function to format field values for display
function formatFieldValue(value: any, field: any): string {
    if (value === null || value === undefined) return ''
    
    switch (field.type) {
        case 'boolean':
            return value ? 'Yes' : 'No'
        case 'date':
            return new Date(value).toLocaleDateString()
        case 'datetime':
            return new Date(value).toLocaleString()
        case 'badge':
        case 'count':
            return String(value)
        case 'json':
            return JSON.stringify(value, null, 2)
        default:
            return String(value)
    }
}

// Load schema when component mounts
onMounted(() => {
    if (model.value) {
        loadSchema(model.value)
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
        
        <!-- Dynamic content based on schema -->
        <template v-else-if="schema">
            <!-- Icon display (if icon field exists and has value) -->
            <div v-if="iconField && crud6.icon" class="uk-text-center">
                <font-awesome-icon :icon="crud6.icon" class="fa-5x" />
            </div>
            
            <!-- Title - use schema title field or fallback to name -->
            <h3 class="uk-text-center uk-margin-remove">
                {{ crud6[schema.title_field || 'name'] || crud6.name }}
            </h3>
            
            <!-- Description - use schema description field or fallback -->
            <p v-if="crud6[schema.description_field || 'description']" class="uk-text-meta">
                {{ crud6[schema.description_field || 'description'] }}
            </p>
            
            <hr />
            
            <!-- Dynamic field display based on schema -->
            <dl class="uk-description-list" v-if="hasViewFieldPermission">
                <template v-for="[fieldKey, field] in Object.entries(displayFields)" :key="fieldKey">
                    <dt v-if="crud6[fieldKey] !== null && crud6[fieldKey] !== undefined">
                        <font-awesome-icon 
                            v-if="field.icon" 
                            :icon="field.icon" 
                            class="uk-margin-small-right" />
                        {{ field.label || fieldKey }}
                    </dt>
                    <dd v-if="crud6[fieldKey] !== null && crud6[fieldKey] !== undefined">
                        <!-- Special handling for badge/count fields -->
                        <span 
                            v-if="field.type === 'badge' || field.type === 'count'" 
                            class="uk-badge">
                            {{ formatFieldValue(crud6[fieldKey], field) }}
                        </span>
                        <!-- Special handling for boolean fields -->
                        <span 
                            v-else-if="field.type === 'boolean'"
                            :class="crud6[fieldKey] ? 'uk-text-success' : 'uk-text-danger'">
                            {{ formatFieldValue(crud6[fieldKey], field) }}
                        </span>
                        <!-- Default display -->
                        <span v-else>
                            {{ formatFieldValue(crud6[fieldKey], field) }}
                        </span>
                    </dd>
                </template>
            </dl>
            
            <hr />
            
            <!-- Action buttons with dynamic permissions -->
            <CRUD6EditModal
                :crud6="crud6"
                :model="model"
                @saved="emits('crud6Updated')"
                v-if="hasUpdatePermission"
                class="uk-width-1-1 uk-margin-small-bottom uk-button uk-button-primary uk-button-small" />
            
            <CRUD6DeleteModal
                :crud6="crud6"
                :model="model"
                @deleted="router.push({ name: 'crud6-list', params: { model: model } })"
                v-if="hasDeletePermission"
                class="uk-width-1-1 uk-margin-small-bottom uk-button uk-button-danger uk-button-small" />
            
            <!-- Slot for additional content -->
            <slot data-test="slot"></slot>
        </template>
        
        <!-- Fallback for legacy display (no schema) -->
        <template v-else>
            <div class="uk-text-center">
                <font-awesome-icon v-if="crud6.icon" :icon="crud6.icon" class="fa-5x" />
            </div>
            <h3 class="uk-text-center uk-margin-remove">{{ crud6.name }}</h3>
            <p class="uk-text-meta">
                {{ crud6.description }}
            </p>
            <hr />
            <dl class="uk-description-list" v-if="$checkAccess('view_crud6_field')">
                <dt><font-awesome-icon icon="users" /> {{ $t('USER', crud6.users_count) }}</dt>
                <dd>
                    <span class="uk-badge">{{ crud6.users_count }}</span>
                </dd>
            </dl>
            <hr />
            <CRUD6EditModal
                :crud6="crud6"
                @saved="emits('crud6Updated')"
                v-if="$checkAccess('update_crud6_field')"
                class="uk-width-1-1 uk-margin-small-bottom uk-button uk-button-primary uk-button-small" />
            <CRUD6DeleteModal
                :crud6="crud6"
                @deleted="router.push({ name: 'admin.groups' })"
                v-if="$checkAccess('delete_crud6_row')"
                class="uk-width-1-1 uk-margin-small-bottom uk-button uk-button-danger uk-button-small" />
            <slot data-test="slot"></slot>
        </template>
    </UFCardBox>
</template>
