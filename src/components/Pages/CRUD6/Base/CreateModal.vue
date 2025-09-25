<script setup lang="ts">
import UIkit from 'uikit'
import CRUD6Form from './Form.vue'

/**
 * Props - Model for schema loading and optional schema to avoid duplicate loads.
 */
const props = defineProps<{
    model?: string
    schema?: any
}>()

console.log('[CreateModal] Component created with props:')
console.log('  - model:', props.model)
console.log('  - schema provided:', !!props.schema)

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
    UIkit.modal('#modal-crud6-create').hide()
}
</script>

<template>
    <a v-bind="$attrs" :uk-toggle="'target: #modal-crud6-create'">
        <slot><font-awesome-icon icon="plus" fixed-width /> {{ $t('CRUD6.CREATE') }}</slot>
    </a>

    <!-- This is the modal -->
    <UFModal id="modal-crud6-create" closable>
        <template #header>{{ $t('CRUD6.CREATE') }}</template>
        <template #default>
            <CRUD6Form :model="props.model" :schema="props.schema" @success="formSuccess()" />
        </template>
    </UFModal>
</template>
