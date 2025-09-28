# Schema Loading Debug Messages

This document outlines the comprehensive debug messages added to track schema loading in the CRUD6 theme, specifically for understanding the flow when accessing routes like `/crud6/groups/1`.

## Overview

Debug messages have been added to provide visibility into:
- When schema API calls are made
- Which components are loading schema vs using provided schema
- The optimization where PageRow loads schema once and passes it to children
- Context about route, model, and component states

## Debug Message Categories

### 🔄 Schema API Calls
- When a schema API call is initiated
- Success/failure of schema loading
- Schema details (title, field count)

### 📊 Schema Resolution
- Whether a component uses provided schema prop or composable
- Schema prop propagation between components
- Decision logic for schema loading

### 🚀 Component Lifecycle
- Component setup and initialization
- Mount state and context
- Modal interactions and lazy loading

### 📍 Context Information
- Route details and parameters
- Model and record ID information
- Create mode vs edit mode detection

## Components with Debug Messages

### 1. PageRow.vue (Main Schema Loader)

**Schema Loading Watcher:**
```
[PageRow] Schema loading watcher triggered - model: groups currentModel:  route: /crud6/groups/1
[PageRow] 🔄 Starting schema API call for model: groups at route: /crud6/groups/1
[PageRow] 📍 Schema loading context - recordId: 1 isCreateMode: false
[PageRow] ✅ Schema loaded successfully for model: groups with fields: name,description,slug
[PageRow] 📊 Schema details - title: Groups field count: 4
```

**Component Mount:**
```
[PageRow] 🚀 Component mounted - route: /crud6/groups/1 model: groups recordId: 1
[PageRow] 📋 Mount state - isCreateMode: false hasSchema: false
[PageRow] 📝 Schema loading delegated to model watcher to avoid duplicate API calls
[PageRow] 📖 Fetching record data for ID: 1
```

**Schema Changes:**
```
[PageRow] 📊 Schema value changed - hasFields: true isCreateMode: false
[PageRow] 📝 Schema available but not in create mode - no record structure update needed
```

### 2. Info.vue (Schema Consumer)

**Schema Resolution:**
```
[Info] 🚀 Component setup - hasProvidedSchema: true crud6.id: 1 route: /crud6/groups/1
[Info] 📊 Schema resolution - providedSchema: true composableSchema: false route: /crud6/groups/1
[Info] ✅ Using provided schema prop from PageRow - NO API call needed
[Info] 📋 Provided schema details - title: Groups fields: name,description,slug,users_count
```

**Modal Interactions:**
```
[Info] 🔧 Edit modal requested - lazy loading EditModal component
[Info] 📊 Schema will be passed to EditModal - title: Groups hasFields: true
```

### 3. Form.vue (Conditional Schema Loader)

**With Provided Schema (Optimized Path):**
```
[Form] 🚀 Component setup - hasProvidedSchema: true model: groups isEdit: true
[Form] 📊 Schema provided by parent - title: Groups fieldCount: 4
[Form] 📊 Model prop changed to: groups hasSchemaProps: true hasLoadSchema: true
[Form] ✅ Using provided schema prop - NO API call for model: groups
[Form] 📋 Provided schema from parent - title: Groups fields: name,description,slug,users_count
[Form] 🎯 This is the OPTIMIZED path - schema loaded once by PageRow and passed down
```

**Without Provided Schema (Fallback Path):**
```
[Form] 🚀 Component setup - hasProvidedSchema: false model: groups isEdit: false
[Form] ⚠️  No schema provided - will attempt to load via composable if model available
[Form] 📊 Model prop changed to: groups hasSchemaProps: false hasLoadSchema: true
[Form] 🔄 Loading schema for model (no schema prop provided): groups
[Form] 📍 Context - this indicates Form is used standalone without PageRow schema prop
[Form] ✅ Schema loaded via composable for model: groups
```

### 4. EditModal.vue (Schema Propagator)

```
[EditModal] 🚀 Component setup - crud6.id: 1 model: groups hasSchema: true
[EditModal] 📊 Schema details passed to Form - title: Groups fields: name,description,slug,users_count
[EditModal] ✅ Form submitted successfully for crud6.id: 1
```

### 5. DeleteModal.vue (Schema Consumer)

```
[DeleteModal] 🚀 Component setup - crud6.id: 1 model: groups hasSchema: true
[DeleteModal] 📊 Schema provided for context - title: Groups
[DeleteModal] 🗑️  Delete confirmed for crud6.slug: test-group
[DeleteModal] ✅ Delete successful for: test-group
```

### 6. CreateModal.vue (Schema Propagator)

```
[CreateModal] 🚀 Component setup - model: groups hasSchema: true
[CreateModal] 📊 Schema provided by parent - title: Groups fieldCount: 4
[CreateModal] ✅ Create form submitted successfully for model: groups
```

## Schema Loading Flow for `/crud6/groups/1`

1. **PageRow.vue** detects model change and loads schema (1 API call)
2. **Info.vue** receives schema prop from PageRow (0 API calls)
3. **EditModal.vue** receives schema prop from Info (0 API calls)  
4. **Form.vue** receives schema prop from EditModal (0 API calls)
5. **DeleteModal.vue** receives schema prop from Info (0 API calls)

**Result:** 1 schema API call total instead of potentially 4+ calls

## Debug Message Prefixes

- `[PageRow]` - Main component that loads schema
- `[Info]` - Component displaying entity information
- `[Form]` - Form component for create/edit
- `[EditModal]` - Modal wrapper for edit form
- `[DeleteModal]` - Modal for deletion confirmation
- `[CreateModal]` - Modal wrapper for create form

## Emoji Legend

- 🚀 Component initialization/setup
- 🔄 Schema API call initiated
- ✅ Successful operation
- ❌ Failed operation
- 📊 Data/schema analysis
- 📍 Context information
- 📋 Data details
- 📖 Data fetching
- 📝 Notes/explanations
- 🎯 Optimization indicators
- 🔧 Edit operations
- 🗑️ Delete operations
- ➕ Create operations
- ⚠️ Warnings/important notes
- ⏭️ Skipped operations

## Benefits

These debug messages provide:

1. **Visibility** into the schema loading optimization
2. **Debugging** capability for schema-related issues
3. **Performance** insight showing API call reduction
4. **Development** assistance for understanding component interactions
5. **Documentation** of the optimized schema loading flow

## Usage

When debugging schema loading issues or understanding the component flow:

1. Open browser dev tools console
2. Navigate to `/crud6/groups/1` (or any CRUD6 entity)
3. Watch the console for debug messages
4. Follow the schema loading flow from PageRow to child components
5. Verify that only 1 schema API call is made despite multiple components needing schema data