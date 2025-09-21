# GitHub Copilot Instructions for theme-crud6

This repository extends UserFrosting 6's Pink Cupcake theme to provide dynamic CRUD operations for any model/entity. The core design principle is to **strictly follow UserFrosting conventions** and utilize all built-in components, composables, and plugins from UserFrosting Core and Admin sprinkles.

## Architecture Principles

### 1. Schema-Driven Development
- **ALWAYS** use the `useCRUD6Schema()` composable to load dynamic schema for models
- Schema drives form fields, table columns, permissions, and validation rules
- Never hardcode field definitions - everything should be schema-based
- Schema loading pattern:
```typescript
const {
    schema,
    loading: schemaLoading,
    error: schemaError,
    loadSchema,
    hasPermission
} = useCRUD6Schema()
```

### 2. Follow Admin Sprinkle Reference Implementation
- **Reference Pattern**: Use Group management in `@userfrosting/sprinkle-admin` as the primary reference
- **Component Naming**: Follow `{Entity}{Action}Modal.vue`, `{Entity}Form.vue`, `{Entity}Info.vue` pattern
- **File Structure**: Mirror the admin sprinkle structure: `components/Pages/{Module}/Base/`
- **Permission Checks**: Use `$checkAccess()` and schema-driven permission functions

### 3. UserFrosting Component Usage

#### Core Components (ALWAYS use these)
```vue
<!-- Tables and Data Display -->
<UFSprunjeTable :dataUrl="apiUrl" :searchColumn="searchColumn">
<UFSprunjeHeader sort="fieldName">
<UFSprunjeColumn>
<UFCardBox title="TITLE">

<!-- Forms and Inputs -->
<UFFormValidationError :errors="r$.$errors.fieldName" />
<UFModal id="modal-id" closable>
<UFModalConfirmation>

<!-- Alerts and Feedback -->
<UFAlert :alert="alertObject" />
<UFLabel :severity="Severity.Success">
<UFErrorPage :errorCode="404" />
```

#### Sprunjer Integration
- **ALWAYS** use UFSprunjeTable for data listing
- **Dynamic Headers**: Generate headers from schema fields
- **Dynamic Columns**: Render columns based on field types from schema
- **Search Configuration**: Use schema to determine searchable fields
- **Sorting**: Enable sorting on schema-defined sortable fields

```vue
<UFSprunjeTable :dataUrl="apiUrl" :searchColumn="searchColumn">
    <template #header>
        <UFSprunjeHeader 
            v-for="[fieldKey, field] in Object.entries(schema.fields || {})"
            :key="fieldKey"
            v-if="field.listable !== false"
            :sort="fieldKey">
            {{ field.label || fieldKey }}
        </UFSprunjeHeader>
    </template>
    <template #body="{ row, sprunjer }">
        <UFSprunjeColumn 
            v-for="[fieldKey, field] in Object.entries(schema.fields || {})"
            :key="fieldKey"
            v-if="field.listable !== false">
            <!-- Dynamic field rendering based on field.type -->
        </UFSprunjeColumn>
    </template>
</UFSprunjeTable>
```

## Component Development Patterns

### 1. Modal Components
Follow the exact pattern from Admin Group components:

```vue
<script setup lang="ts">
import UIkit from 'uikit'
import type { CRUD6Interface } from '@ssnukala/sprinkle-crud6/interfaces'
import CRUD6Form from './Form.vue'

const props = defineProps<{
    crud6: CRUD6Interface
}>()

const emits = defineEmits(['saved'])

const formSuccess = () => {
    emits('saved')
    UIkit.modal('#modal-crud6-edit-' + props.crud6.id).hide()
}
</script>

<template>
    <a :href="'#modal-crud6-edit-' + props.crud6.id" v-bind="$attrs" uk-toggle>
        <slot><font-awesome-icon icon="pen-to-square" /> {{ $t('CRUD6.EDIT') }}</slot>
    </a>
    
    <UFModal :id="'modal-crud6-edit-' + props.crud6.id" closable>
        <template #header>{{ $t('CRUD6.EDIT') }}</template>
        <template #default>
            <CRUD6Form :crud6="props.crud6" @success="formSuccess()" />
        </template>
    </UFModal>
</template>
```

#### Create Modal Pattern
For create modals, don't pass a prop (follows UserFrosting Group pattern):

```vue
<script setup lang="ts">
import UIkit from 'uikit'
import CRUD6Form from './Form.vue'

const emits = defineEmits(['saved'])

const formSuccess = () => {
    emits('saved')
    UIkit.modal('#modal-crud6-create').hide()
}
</script>

<template>
    <a v-bind="$attrs" :uk-toggle="'target: #modal-crud6-create'">
        <slot><font-awesome-icon icon="plus" /> {{ $t('CRUD6.CREATE') }}</slot>
    </a>

    <UFModal id="modal-crud6-create" closable>
        <template #header>{{ $t('CRUD6.CREATE') }}</template>
        <template #default>
            <CRUD6Form @success="formSuccess()" />
        </template>
    </UFModal>
</template>
```

### 2. Form Components
Forms must be **completely schema-driven**:

```vue
<script setup lang="ts">
import { watch, computed, onMounted } from 'vue'
import { useCRUD6Api, useCRUD6Schema } from '@ssnukala/sprinkle-crud6/composables'

const props = defineProps<{ 
    crud6?: CRUD6Interface
    model?: string
}>()

const { createRow, updateRow, r$, formData, apiLoading, resetForm, slugLocked } = useCRUD6Api()
const { schema, loadSchema } = useCRUD6Schema()

// Schema-driven field filtering
const editableFields = computed(() => {
    if (!schema.value?.fields) return {}
    return Object.fromEntries(
        Object.entries(schema.value.fields).filter(([key, field]) => field.editable !== false)
    )
})

// Dynamic form rendering based on field types
const renderField = (fieldKey: string, field: any) => {
    switch (field.type) {
        case 'string':
        case 'email':
        case 'url':
            return 'input'
        case 'text':
            return 'textarea'
        case 'boolean':
            return 'checkbox'
        case 'date':
        case 'datetime':
            return 'date-input'
        default:
            return 'input'
    }
}
</script>
```

### 3. Info/Display Components
Display components should be dynamic and permission-aware:

```vue
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCRUD6Schema } from '@ssnukala/sprinkle-crud6/composables'

const { crud6 } = defineProps<{ crud6: CRUD6Response }>()
const route = useRoute()
const model = computed(() => route.params.model as string)

const { schema, loadSchema, hasPermission } = useCRUD6Schema()

// Permission-driven display
const displayFields = computed(() => {
    if (!schema.value?.fields) return {}
    return Object.fromEntries(
        Object.entries(schema.value.fields).filter(([key, field]) => 
            field.displayable !== false && hasPermission('view_field')
        )
    )
})

// Dynamic field value formatting
function formatFieldValue(value: any, field: any): string {
    switch (field.type) {
        case 'boolean':
            return value ? 'Yes' : 'No'
        case 'date':
            return new Date(value).toLocaleDateString()
        case 'datetime':
            return new Date(value).toLocaleString()
        case 'json':
            return JSON.stringify(value, null, 2)
        default:
            return String(value)
    }
}
</script>
```

## Permission System Integration

### 1. Permission Checks
Use UserFrosting's permission system consistently:

```vue
<!-- Template permission checks -->
<div v-if="$checkAccess('view_crud6_field')">
<button v-if="$checkAccess('update_crud6_field')">
<UFModalConfirmation v-if="$checkAccess('delete_crud6')">

<!-- Composable permission checks -->
const hasCreatePermission = computed(() => hasPermission('create'))
const hasEditPermission = computed(() => hasPermission('update'))
const hasDeletePermission = computed(() => hasPermission('delete'))
```

### 2. Schema-Driven Permissions
Schema can define field-level permissions:

```typescript
const canViewField = (fieldKey: string) => {
    const field = schema.value?.fields[fieldKey]
    return field?.permissions?.view !== false && hasPermission('view_field')
}

const canEditField = (fieldKey: string) => {
    const field = schema.value?.fields[fieldKey]
    return field?.permissions?.edit !== false && hasPermission('update_field')
}
```

## API Integration Patterns

### 1. Composable Usage
ALWAYS use the provided composables, following UserFrosting naming conventions:

```typescript
// API operations (follows UserFrosting pattern: use{Entity}Api)
const { 
    fetchCRUD6,           // Fetch list of entities
    fetchCRUD6Row,        // Fetch single entity  
    createRow,            // Create new entity
    updateRow,            // Update existing entity
    deleteRow,            // Delete entity
    apiLoading, 
    apiError,
    formData,
    resetForm,
    slugLocked            // For slug field management
} = useCRUD6Api()

// Schema operations (schema-specific composable)
const {
    schema,               // Current schema object
    loading: schemaLoading,
    error: schemaError,
    loadSchema,           // Load schema for a model
    hasPermission,        // Check permissions
    tableColumns,         // Get table column definitions
    defaultSort          // Get default sorting
} = useCRUD6Schema()
```

**Important**: The composable methods follow UserFrosting patterns:
- `create{Entity}` for creating new records
- `update{Entity}` for updating existing records  
- `delete{Entity}` for deleting records
- `fetch{Entity}` for getting lists
- `fetch{Entity}Row` for getting single records

### 2. Error Handling
Follow UserFrosting error patterns:

```vue
<template>
    <UFErrorPage :errorCode="error.status || 500" v-if="error" />
    <div v-else-if="loading" class="uk-text-center uk-padding">
        <div uk-spinner></div>
        <p>{{ $t('LOADING') }}</p>
    </div>
    <template v-else>
        <!-- Content -->
    </template>
</template>
```

### 3. API URL Construction
URLs should be dynamic and model-based:

```typescript
const apiUrl = computed(() => model.value ? `/api/crud6/${model.value}` : '/api/groups')
const rowApiUrl = computed(() => model.value && recordId.value ? 
    `/api/crud6/${model.value}/${recordId.value}` : null)
```

## Alert and Notification System

### 1. Alert Component Usage
Use UFAlert for all notifications:

```vue
<UFAlert :alert="alertObject" @close="handleClose" />
```

Where alertObject follows:
```typescript
interface AlertInterface {
    style: Severity
    title: string
    description?: string
    closeBtn?: boolean
    hideIcon?: boolean
}
```

### 2. Severity Levels
Import and use Severity enum:

```typescript
import { Severity } from '@userfrosting/sprinkle-core/interfaces'

// Usage
<UFLabel :severity="Severity.Success">Enabled</UFLabel>
<UFLabel :severity="Severity.Danger">Disabled</UFLabel>
```

## Exception and Error Handling

### 1. API Error Handling
Handle errors gracefully using the established patterns:

```typescript
const submitForm = async () => {
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
        .catch((error) => {
            // Error handling is done by the composable
            // Just log for debugging if needed
            console.error('API operation failed:', error)
        })
}
```

### 2. Schema Loading Errors
Handle schema errors consistently:

```vue
<div v-if="schemaError" class="uk-alert-danger" uk-alert>
    <h4>{{ schemaError.title }}</h4>
    <p>{{ schemaError.description }}</p>
</div>
```

## Testing Conventions

### 1. Component Testing
Follow existing test patterns:

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ComponentName from './ComponentName.vue'

describe('ComponentName', () => {
    it('renders correctly with schema', () => {
        const wrapper = mount(ComponentName, {
            props: {
                model: 'testModel',
                crud6: mockData
            }
        })
        expect(wrapper.find('[data-test="expected-element"]').exists()).toBe(true)
    })
})
```

### 2. Data Test Attributes
Add data-test attributes for testability:

```vue
<input data-test="name" v-model="formData.name" />
<button data-test="submit-btn" @click="submitForm">
```

## Code Style and TypeScript

### 1. TypeScript Usage
- **ALWAYS** use proper TypeScript interfaces
- Import types from the appropriate sprinkle packages
- Define component props with proper typing:

```typescript
import type { CRUD6Interface, CRUD6Response } from '@ssnukala/sprinkle-crud6/interfaces'
import type { GroupInterface } from '@userfrosting/sprinkle-account/interfaces'

const props = defineProps<{
    crud6: CRUD6Interface
    model?: string
}>()
```

### 2. Reactive Data Patterns
Use Vue 3 Composition API correctly:

```typescript
import { ref, computed, watch, onMounted } from 'vue'

// Reactive references
const loading = ref(false)
const data = ref<CRUD6Interface[]>([])

// Computed properties
const filteredData = computed(() => 
    data.value.filter(item => item.active)
)

// Watchers
watch(
    () => props.model,
    (newModel) => {
        if (newModel) {
            loadSchema(newModel)
        }
    },
    { immediate: true }
)
```

### 3. Import Organization
Organize imports in this order:

```typescript
// Vue imports
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// UserFrosting core imports
import { Severity } from '@userfrosting/sprinkle-core/interfaces'
import { usePageMeta } from '@userfrosting/sprinkle-core/stores'

// CRUD6 specific imports
import { useCRUD6Api, useCRUD6Schema } from '@ssnukala/sprinkle-crud6/composables'
import type { CRUD6Interface, CRUD6Response } from '@ssnukala/sprinkle-crud6/interfaces'

// Local component imports
import CRUD6Form from './Form.vue'
import CRUD6EditModal from './EditModal.vue'
```

## Vue.js Best Practices

### 1. Component Structure
Follow this structure for all components:

```vue
<script setup lang="ts">
// Imports
// Props and Emits
// Composables
// Reactive data
// Computed properties
// Methods
// Watchers
// Lifecycle hooks
</script>

<template>
<!-- Template with proper UIKit classes -->
</template>
```

### 2. Emits Definition
Always define emits explicitly:

```typescript
const emits = defineEmits<{
    success: []
    saved: []
    deleted: []
    crud6Updated: []
}>()
```

### 3. Slot Usage
Use slots for extensibility, following the admin pattern:

```vue
<template>
    <!-- Component content -->
    <slot data-test="slot"></slot>
</template>
```

## Plugin Registration

### 1. Component Registration
Register components globally in plugin files:

```typescript
import type { App } from 'vue'
import {
    CRUD6RowPage,
    CRUD6ListPage,
} from '../views/CRUD6'

export default {
    install: (app: App) => {
        app.component('UFCRUD6RowPage', CRUD6RowPage)
           .component('UFCRUD6ListPage', CRUD6ListPage)
    }
}

// TypeScript module declaration
declare module 'vue' {
    export interface GlobalComponents {
        UFCRUD6RowPage: typeof CRUD6RowPage
        UFCRUD6ListPage: typeof CRUD6ListPage
    }
}
```

### 2. Naming Conventions
- **Global Components**: Prefix with `UF` (e.g., `UFCRUD6RowPage`)
- **Local Components**: Use descriptive names (e.g., `CRUD6Form`, `CRUD6Info`)
- **Files**: Use PascalCase for component files
- **Props/Events**: Use camelCase

## Integration Guidelines

### 1. With sprinkle-crud6
This theme extends `@ssnukala/sprinkle-crud6`:
- Use provided composables and interfaces
- Don't duplicate functionality that exists in the sprinkle
- Extend UI components only, keep business logic in the sprinkle

### 2. With UserFrosting Core
- Leverage all existing core components
- Use established patterns for routing, permissions, and API calls
- Follow the same architecture as admin sprinkle for consistency

### 3. UIKit Integration
- Use UIKit classes for styling: `uk-grid`, `uk-card`, `uk-button`, etc.
- Follow UIKit component patterns for modals, forms, and tables
- Use FontAwesome icons consistently with UserFrosting patterns

## Internationalization (i18n) Patterns

### 1. Translation Keys
Follow UserFrosting translation key conventions:

```vue
<!-- Entity-specific translations -->
{{ $t('CRUD6.CREATE') }}
{{ $t('CRUD6.EDIT') }}
{{ $t('CRUD6.DELETE') }}
{{ $t('CRUD6.DELETE_CONFIRM', entityObject) }}

<!-- Generic translations from core -->
{{ $t('SAVE') }}
{{ $t('CANCEL') }}
{{ $t('LOADING') }}
{{ $t('ENABLED') }}
{{ $t('DISABLED') }}

<!-- Form field labels -->
{{ $t('NAME') }}
{{ $t('DESCRIPTION') }}
{{ $t('SLUG') }}

<!-- Status and count translations -->
{{ $t('USER', count) }}  <!-- For pluralization -->
{{ $t('STATUS') }}
```

### 2. Translation with Parameters
Pass objects for variable substitution (UserFrosting pattern):

```vue
<div v-html="$t('CRUD6.DELETE_CONFIRM', props.crud6)"></div>
```

## UIKit and FontAwesome Integration

### 1. UIKit Classes
Use UIKit classes consistently throughout:

```vue
<!-- Layout classes -->
<div class="uk-container uk-container-large">
<div class="uk-grid-small" uk-grid>
<div class="uk-width-1-2@m">

<!-- Card components -->
<div class="uk-card uk-card-default uk-card-body">

<!-- Form styling -->
<form class="uk-form-stacked">
<div class="uk-margin">
<label class="uk-form-label">
<input class="uk-input" :class="{ 'uk-form-danger': hasError }">

<!-- Button styling -->
<button class="uk-button uk-button-primary">
<button class="uk-button uk-button-danger uk-button-small">

<!-- Alert styling -->
<div class="uk-alert-success" uk-alert>
<div class="uk-alert-danger" uk-alert>
```

### 2. FontAwesome Icons
Use FontAwesome icons consistently with UserFrosting patterns:

```vue
<!-- Standard icons for actions -->
<font-awesome-icon icon="plus" />          <!-- Create -->
<font-awesome-icon icon="pen-to-square" /> <!-- Edit -->
<font-awesome-icon icon="trash" />         <!-- Delete -->
<font-awesome-icon icon="eye" />           <!-- View -->
<font-awesome-icon icon="users" />         <!-- Users/Groups -->

<!-- Form field icons -->
<font-awesome-icon icon="tag" />           <!-- Slug field -->
<font-awesome-icon icon="envelope" />      <!-- Email field -->
<font-awesome-icon icon="lock" />          <!-- Locked slug -->
<font-awesome-icon icon="lock-open" />     <!-- Unlocked slug -->

<!-- Status icons -->
<font-awesome-icon icon="circle-check" />     <!-- Success -->
<font-awesome-icon icon="triangle-exclamation" /> <!-- Warning/Error -->

<!-- Always use fixed-width for consistent alignment -->
<font-awesome-icon icon="icon-name" fixed-width />
```

1. **Start with schema** - Load and use schema for everything
2. **Follow admin patterns** - Mirror Group management exactly
3. **Use UserFrosting components** - Never recreate existing functionality  
4. **Permission-aware** - Check permissions at all levels
5. **Dynamic and flexible** - Everything should work with any model
6. **Consistent styling** - Use UIKit and existing patterns
7. **Proper TypeScript** - Type everything correctly
8. **Test coverage** - Add data-test attributes and write tests

The goal is seamless integration with UserFrosting's ecosystem while providing dynamic CRUD capabilities for any model.