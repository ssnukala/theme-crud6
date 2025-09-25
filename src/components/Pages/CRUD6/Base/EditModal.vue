<script setup lang="ts">
import UIkit from 'uikit'
import type { CRUD6Interface } from '@ssnukala/sprinkle-crud6/interfaces'
import CRUD6Form from './Form.vue'

/**
 * Props - The CRUD6 object to edit, model for schema loading, and optional schema to avoid duplicate loads.
 */
const props = defineProps<{
    crud6: CRUD6Interface
    model?: string
    schema?: any
}>()

console.log('[EditModal] Component created with props:')
console.log('  - model:', props.model)
console.log('  - schema provided:', !!props.schema)
console.log('  - crud6 id:', props.crud6?.id)

/**
 * Emits - Define the saved event. This event is emitted when the form is saved
 * to notify the parent component to refresh the data.
 */
const emits = defineEmits(['saved'])

/**
 * Methods - Submit the form to the API and handle the response.
 */
const formSuccess = () => {
    emits('saved')
    UIkit.modal('#modal-crud6-edit-' + props.crud6.id).hide()
}
</script>

<template>
    <a :href="'#modal-crud6-edit-' + props.crud6.id" v-bind="$attrs" uk-toggle>
        <slot> <font-awesome-icon icon="pen-to-square" fixed-width /> {{ $t('CRUD6.EDIT') }} </slot>
    </a>

    <!-- This is the modal -->
    <UFModal :id="'modal-crud6-edit-' + props.crud6.id" closable>
        <template #header> {{ $t('CRUD6.EDIT') }} </template>
        <template #default>
            <CRUD6Form :crud6="props.crud6" :model="props.model" :schema="props.schema" @success="formSuccess()" />
        </template>
    </UFModal>
</template>
