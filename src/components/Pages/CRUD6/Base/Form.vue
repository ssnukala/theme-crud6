<script setup lang="ts">

// TODO : Rewrite this to use useCRUD6Schema to get the fields and labels dynamically instead of hardcoding them
// Need to maintain the compatibility with the Userfrosting 6 features like Sprunjer, Form, Permissions, etc.
// user userfrosting/sprinkle-admin in that Group as reference

import { watch } from 'vue'
import { useCRUD6Api } from '@ssnukala/sprinkle-crud6/composables'
import type { CRUD6Interface } from '@ssnukala/sprinkle-crud6/interfaces'
import { useCRUD6Schema } from '@ssnukala/sprinkle-crud6/composables'

/**
 * Props - Optional group object for editing.
 */
const props = defineProps<{ crud6?: CRUD6Interface }>()

/**
 * API - Use the group edit API.
 */
const { createRow, updateRow, r$, formData, apiLoading, resetForm, slugLocked } = useCRUD6Api()

/**
 * Watchers - Watch for changes in the group prop and update formData
 * accordingly. Useful when the group prop is updated from the parent component,
 * or the modal is reused.
 */

 /* TODO : Need to change this to use incoming property that will provide the fields */
watch(
    () => props.crud6,
    (crud6) => {
        if (crud6) {
            formData.value.slug = crud6.slug
            formData.value.name = crud6.name
            formData.value.description = crud6.description
            formData.value.icon = crud6.icon
        }
    },
    { immediate: true }
)

/**
 * Emits
 */
const emits = defineEmits(['success'])

/**
 * Methods - Submit the form to the API and handle the response.
 */
const submitForm = async () => {
    // Make sure validation is up to date
    const isValid = await r$.$validate()
    if (!isValid.valid) return

    const apiCall = props.crud6
        ? updateRow(props.crud6.slug, formData.value)
        : createRow(formData.value)
    apiCall
        .then(() => {
            emits('success')
            resetForm()
        })
        .catch(() => {})
}
// TODO : Need to change the labels and fields in the template below to be dynamic or use slots

</script>


<template>
    <form v-on:submit.prevent="submitForm()">
        <fieldset class="uk-fieldset uk-form-stacked">
            <div class="uk-margin">
                <label class="uk-form-label" for="form-stacked-text">{{ $t('CRUD6.NAME') }}</label>
                <div class="uk-inline uk-width-1-1">
                    <font-awesome-icon class="fa-form-icon" icon="pen-to-square" fixed-width />
                    <input
                        class="uk-input"
                        :class="{ 'uk-form-danger': r$.name.$error }"
                        type="text"
                        :placeholder="$t('CRUD6.NAME_EXPLAIN')"
                        aria-label="Group Name"
                        data-test="name"
                        autofocus
                        tabindex="1"
                        v-model="formData.name" />
                    <UFFormValidationError :errors="r$.$errors.name" />
                </div>
            </div>

            <div class="uk-margin">
                <label class="uk-form-label" for="form-stacked-text">{{ $t('SLUG') }}</label>
                <div class="uk-inline uk-width-1-1">
                    <font-awesome-icon class="fa-form-icon" icon="tag" fixed-width />
                    <button
                        class="uk-button uk-button-default uk-form-button"
                        type="button"
                        :uk-tooltip="$t('OVERRIDE')"
                        @click="slugLocked = !slugLocked">
                        <font-awesome-icon fixed-width :icon="slugLocked ? 'lock' : 'lock-open'" />
                    </button>
                    <input
                        class="uk-input"
                        :class="{ 'uk-form-danger': r$.slug.$error }"
                        :disabled="slugLocked"
                        type="text"
                        :placeholder="$t('SLUG')"
                        aria-label="Group Slug"
                        data-test="slug"
                        tabindex="2"
                        v-model="formData.slug" />
                    <UFFormValidationError :errors="r$.$errors.slug" />
                </div>
            </div>

            <div class="uk-margin">
                <label class="uk-form-label" for="form-stacked-text">{{ $t('CRUD6.ICON') }}</label>
                <span class="uk-text-meta">{{ $t('CRUD6.ICON_EXPLAIN') }}</span>
                <div class="uk-inline uk-width-1-1">
                    <font-awesome-icon
                        class="fa-form-icon"
                        :icon="formData.icon"
                        v-if="formData.icon"
                        fixed-width />
                    <input
                        class="uk-input"
                        :class="{ 'uk-form-danger': r$.icon.$error }"
                        type="text"
                        :placeholder="$t('CRUD6.ICON')"
                        aria-label="Row Icon"
                        data-test="icon"
                        tabindex="3"
                        v-model="formData.icon" />
                    <UFFormValidationError :errors="r$.$errors.icon" />
                </div>
            </div>

            <div class="uk-margin">
                <label class="uk-form-label" for="form-stacked-text">{{ $t('DESCRIPTION') }}</label>
                <textarea
                    class="uk-textarea"
                    :class="{ 'uk-form-danger': r$.description.$error }"
                    placeholder="Row Description"
                    aria-label="Row Description"
                    data-test="description"
                    rows="6"
                    tabindex="4"
                    v-model="formData.description" />
                <UFFormValidationError :errors="r$.$errors.description" />
            </div>

            <div class="uk-text-right" uk-margin>
                <button class="uk-button uk-button-default uk-modal-close" type="button">
                    {{ $t('CANCEL') }}
                </button>
                <button
                    class="uk-button uk-button-primary"
                    :disabled="r$.$error || apiLoading"
                    type="submit"
                    tabindex="5">
                    {{ $t('SAVE') }}
                </button>
            </div>
        </fieldset>
    </form>
</template>
