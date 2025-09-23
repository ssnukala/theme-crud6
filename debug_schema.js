// Debug script to understand the schema response structure
const mockApiResponse = {
    "message": "CRUD6.API.SUCCESS",
    "model": "groups",
    "schema": {
        "model": "groups",
        "title": "Group Management",
        "description": "Manage user groups and roles",
        "table": "groups",
        "primary_key": "id",
        "timestamps": true,
        "soft_delete": false,
        "permissions": {
            "read": "uri_groups",
            "create": "create_group",
            "update": "update_group",
            "delete": "delete_group"
        },
        "default_sort": { "name": "asc" },
        "fields": {
            "id": {
                "type": "integer",
                "label": "ID",
                "auto_increment": true,
                "readonly": true,
                "sortable": true,
                "filterable": false,
                "searchable": false,
                "listable": true
            },
            "name": {
                "type": "string",
                "label": "Group Name",
                "required": true,
                "sortable": true,
                "filterable": true,
                "searchable": true,
                "listable": true,
                "validation": {
                    "required": true,
                    "length": { "min": 2, "max": 100 }
                }
            },
            "slug": {
                "type": "string",
                "label": "Slug",
                "required": true,
                "sortable": true,
                "filterable": true,
                "searchable": true,
                "listable": true,
                "validation": {
                    "required": true,
                    "slug": true
                }
            },
            "description": {
                "type": "text",
                "label": "Description",
                "required": false,
                "sortable": false,
                "filterable": false,
                "searchable": true,
                "listable": true
            },
            "icon": {
                "type": "string",
                "label": "Icon",
                "required": false,
                "sortable": false,
                "filterable": false,
                "searchable": false,
                "listable": false
            }
        }
    }
};

console.log("Full API response:", JSON.stringify(mockApiResponse, null, 2));
console.log("\nThe schema part:", JSON.stringify(mockApiResponse.schema, null, 2));
console.log("\nThe fields part:", JSON.stringify(mockApiResponse.schema.fields, null, 2));
console.log("\nObject.entries(mockApiResponse.schema.fields):", Object.entries(mockApiResponse.schema.fields));

// Simulate what the composable does:
// const response = await axios.get(`/api/crud6/${model}/schema`)
// schema.value = response.data

// The problem: the API response has a structure like:
// response.data = { message: ..., model: ..., schema: {...} }
// But the composable is doing: schema.value = response.data
// This means schema.value gets the entire response, not just the schema part!

console.log("\nPROBLEM IDENTIFIED:");
console.log("The composable sets schema.value = response.data");
console.log("But response.data contains the entire API response, not just the schema");
console.log("So schema.value.fields becomes response.data.fields which is undefined");
console.log("We need: schema.value.fields = response.data.schema.fields");