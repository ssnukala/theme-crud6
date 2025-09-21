<script setup lang="ts">
import { useCRUD6Api } from '@ssnukala/sprinkle-crud6/composables'
import type { CRUD6Interface } from '@ssnukala/sprinkle-crud6/interfaces'
import { Severity } from '@userfrosting/sprinkle-core/interfaces'

/**
 * Variables and composables
 */
const { deleteCRUD6 } = useCRUD6Api()

/**
 * Props - The CRUD6 object to delete
 */
const props = defineProps<{
    crud6: CRUD6Interface
}>()

/**
 * Emits - Define the deleted event. This event is emitted when the CRUD6 object is deleted
 * to notify the parent component to refresh the data.
 */
const emits = defineEmits(['deleted'])

/**
 * Methods - Submit the form to the API and handle the response.
 */
const deleteConfirmed = () => {
    deleteCRUD6(props.crud6.slug)
        .then(() => {
            emits('deleted')
        })
        .catch(() => {})
}
</script>

<template>
    <a :href="'#confirm-crud6-delete-' + props.crud6.id" v-bind="$attrs" uk-toggle>
        <slot><font-awesome-icon icon="trash" fixed-width /> {{ $t('CRUD6.DELETE') }}</slot>
    </a>

    <!-- This is the modal -->
    <UFModalConfirmation
        :id="'confirm-crud6-delete-' + props.crud6.id"
        title="CRUD6.DELETE"
        @confirmed="deleteConfirmed()"
        acceptLabel="CRUD6.DELETE_YES"
        acceptIcon="trash"
        :rejectIcon="null"
        :acceptSeverity="Severity.Danger">
        <template #prompt>
            <div v-html="$t('CRUD6.DELETE_CONFIRM', props.crud6)"></div>
        </template>
    </UFModalConfirmation>
</template> 
