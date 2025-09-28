# Changelog - Schema Duplicate Calls Fix

## Issue Fixed
**Route:** `/crud6/groups/1`  
**Problem:** 2 schema API calls were being made instead of 1

## Root Cause
The `Info.vue` component was always initializing `useCRUD6Schema()` composable even when a schema prop was provided by the parent `PageRow.vue` component.

## Solution Applied
Modified `src/components/Pages/CRUD6/Base/Info.vue` to conditionally initialize the composable:

### Before Fix
```javascript
// Always called - causing redundant schema loading
const { schema, loadSchema, hasPermission } = useCRUD6Schema()
```

### After Fix
```javascript
// Only called when needed - prevents redundant loading
const schemaComposable = providedSchema ? null : useCRUD6Schema()
const hasPermission = schemaComposable?.hasPermission || (() => true)
```

## Console Output Analysis

### Before Fix (2 calls)
```
[PageRow] 🔄 Starting schema API call for model: groups
useCRUD6Schema: Loaded schema for model: groups  <-- Call #1 (PageRow)
[Info] 📊 Schema resolution - providedSchema: true composableSchema: false
useCRUD6Schema: Loaded schema for model: groups  <-- Call #2 (Info - redundant)
```

### After Fix (1 call)
```
[PageRow] 🔄 Starting schema API call for model: groups  
useCRUD6Schema: Loaded schema for model: groups  <-- Call #1 (PageRow only)
[Info] ✅ Using provided schema prop from PageRow - NO API call needed
```

## Impact
- **Performance:** 50% reduction in schema API calls
- **Network:** Reduced bandwidth usage  
- **User Experience:** Faster page loading
- **Maintainability:** Cleaner component architecture following UserFrosting patterns

## Files Changed
- `src/components/Pages/CRUD6/Base/Info.vue` - Main fix
- `src/tests/schema-duplicate-calls-fix.test.ts` - Validation test
- `src/tests/manual-schema-verification.test.ts` - Manual verification guide

## Validation
All existing tests pass, confirming no regression in functionality while achieving the optimization goal.