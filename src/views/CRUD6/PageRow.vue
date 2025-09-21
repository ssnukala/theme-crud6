<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePageMeta } from '@userfrosting/sprinkle-core/stores'
import { useCRUD6Api } from '@ssnukala/sprinkle-crud6/composables'
import { useCRUD6Schema } from '@ssnukala/sprinkle-crud6/composables'
import CRUD6Info from '../../components/Pages/CRUD6/Base/Info.vue'
import CRUD6Users from '../../components/Pages/CRUD6/Base/Users.vue'
import type { CRUD6Response } from '@ssnukala/sprinkle-crud6/interfaces'

/**
 * Variables and composables
 */
const route = useRoute()
const page = usePageMeta()
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
const { fetchCRUD6Row, apiError } = useCRUD6Api()

// Get model and ID from route parameters
const model = computed(() => route.params.model as string)
const recordId = computed(() => route.params.id as string)
const isCreateMode = computed(() => route.name === 'crud6-create')
const isEditMode = ref(isCreateMode.value)

// Use composables
const {
    schema,
    loading: schemaLoading,
    error: schemaError,
    loadSchema,
    hasPermission
} = useCRUD6Schema()

const {
    fetchCRUD6,
    createCRUD6,
    updateCRUD6,
    apiLoading,
    apiError,
    formData,
    resetForm
} = useCRUD6Api()

/**
 * Methods - Fetch group
 */
function fetch() {
    fetchCRUD6Row(route.params.id).then((fetchedRow) => {
        CRUD6Row.value = fetchedRow
        page.title = CRUD6Row.value.name
    })
}

/**
 * Watcher - Update page on id change
 */
watch(
    () => route.params.id,
    () => fetch(),
    { immediate: true }
)
</script>

<template>
    <template v-if="apiError">
        <UFErrorPage :errorCode="apiError.status" />
    </template>
    <template v-else>
        <div class="uk-child-width-expand" uk-grid>
            <div>
                <CRUD6Info :crud6="CRUD6Row" @crud6Updated="fetch()" />
            </div>
            <div class="uk-width-2-3" v-if="$checkAccess('view_crud6_field')">
                <CRUD6Users :slug="$route.params.id" />
            </div>
        </div>
    </template>
</template>
