import { computed } from 'vue'
import { useCRUD6Schema as useRawCRUD6Schema } from '@ssnukala/sprinkle-crud6/composables'

/**
 * Fixed wrapper for useCRUD6Schema that handles the nested API response structure.
 * 
 * The sprinkle-crud6 API returns schema data in the format:
 * { message: "...", model: "...", schema: { ... actual schema ... } }
 * 
 * But the composable incorrectly assigns schema.value = response.data instead of
 * schema.value = response.data.schema, causing schema.fields to be undefined.
 * 
 * This wrapper fixes that by extracting the nested schema structure.
 */
export function useCRUD6Schema(modelName?: string) {
    const {
        schema: rawSchema,
        loading,
        error,
        loadSchema,
        hasPermission,
        tableColumns,
        defaultSort
    } = useRawCRUD6Schema(modelName)

    // Fix schema structure - handle nested schema in API response
    const schema = computed(() => {
        if (!rawSchema.value) return null
        
        // If the API response has the schema nested under 'schema' property
        if ((rawSchema.value as any).schema && (rawSchema.value as any).schema.fields) {
            return (rawSchema.value as any).schema
        }
        
        // Otherwise, assume it's already the correct schema structure
        return rawSchema.value
    })

    return {
        schema,
        loading,
        error,
        loadSchema,
        hasPermission,
        tableColumns,
        defaultSort
    }
}