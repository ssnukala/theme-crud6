<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { CRUD6Response } from '@ssnukala/sprinkle-crud6/interfaces'
import CRUD6EditModal from './EditModal.vue'
import CRUD6DeleteModal from './DeleteModal.vue'

const router = useRouter()
const { crud6 } = defineProps<{
    crud6: CRUD6Response
}>()

const emits = defineEmits(['crud6Updated'])
</script>

<!-- TODO : This is just copied from Group, need to update this template to read from the schema
 so we can build the form dynamically -->

<template>
    <UFCardBox>
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
    </UFCardBox>
</template>
