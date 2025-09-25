import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Form from '../components/Pages/CRUD6/Base/Form.vue'

// Mock the composables
vi.mock('@ssnukala/sprinkle-crud6/composables', () => ({
  useCRUD6Api: () => ({
    createRow: vi.fn(),
    updateRow: vi.fn(),
    r$: { $validate: vi.fn().mockResolvedValue({ valid: true }), $errors: {} },
    formData: ref({}),
    apiLoading: ref(false),
    resetForm: vi.fn(),
    slugLocked: ref(false)
  }),
  useCRUD6Schema: () => ({
    schema: ref(null),
    loading: ref(false),
    error: ref(null),
    loadSchema: mockLoadSchema,
    hasPermission: vi.fn(() => true)
  })
}))

// Track schema loading calls
let schemaLoadCallCount = 0
const mockLoadSchema = vi.fn().mockImplementation((model: string) => {
  schemaLoadCallCount++
  console.log(`Schema load call #${schemaLoadCallCount} for model: ${model}`)
  return Promise.resolve()
})

const mockT = (key: string) => key

const mockSchema = {
  title: 'Groups',
  fields: {
    name: { type: 'string', label: 'Name', editable: true },
    description: { type: 'text', label: 'Description', editable: true }
  }
}

describe('Schema Loading Fix Validation', () => {
  beforeEach(() => {
    schemaLoadCallCount = 0
    vi.clearAllMocks()
  })

  it('should NOT call loadSchema when schema prop is provided', () => {
    // Simulate multiple Form components created with schema prop (like in PageList with modals)
    const formInstances = []
    
    for (let i = 0; i < 7; i++) {
      const wrapper = mount(Form, {
        props: {
          model: 'groups',
          schema: mockSchema  // Schema is provided, so loadSchema should NOT be called
        },
        global: {
          stubs: {
            'font-awesome-icon': true,
            'UFFormValidationError': true
          },
          mocks: {
            $t: mockT
          }
        }
      })
      formInstances.push(wrapper)
    }

    // With the fix, loadSchema should never be called when schema prop is provided
    expect(mockLoadSchema).not.toHaveBeenCalled()
    expect(schemaLoadCallCount).toBe(0)
  })

  it('should call loadSchema ONLY when no schema prop is provided', () => {
    // Create Form without schema prop - should load schema
    mount(Form, {
      props: {
        model: 'groups'
        // No schema prop provided
      },
      global: {
        stubs: {
          'font-awesome-icon': true,
          'UFFormValidationError': true
        },
        mocks: {
          $t: mockT
        }
      }
    })

    // Should call loadSchema exactly once
    expect(mockLoadSchema).toHaveBeenCalledOnce()
    expect(mockLoadSchema).toHaveBeenCalledWith('groups')
    expect(schemaLoadCallCount).toBe(1)
  })

  it('should demonstrate the fix: PageList scenario with 7 EditModals', () => {
    // Reset counter
    schemaLoadCallCount = 0
    vi.clearAllMocks()

    // Simulate PageList scenario:
    // 1. PageList loads schema (simulated by direct call)
    mockLoadSchema('groups') // This represents PageList loading schema
    expect(schemaLoadCallCount).toBe(1)

    // 2. Create 7 EditModal->Form components with schema prop (representing table rows)
    for (let i = 0; i < 7; i++) {
      mount(Form, {
        props: {
          model: 'groups',
          schema: mockSchema  // PageList passes schema to modals
        },
        global: {
          stubs: {
            'font-awesome-icon': true,  
            'UFFormValidationError': true
          },
          mocks: {
            $t: mockT
          }
        }
      })
    }

    // 3. Create 1 CreateModal->Form component with schema prop
    mount(Form, {
      props: {
        model: 'groups',
        schema: mockSchema  // PageList passes schema to CreateModal
      },
      global: {
        stubs: {
          'font-awesome-icon': true,
          'UFFormValidationError': true
        },
        mocks: {
          $t: mockT
        }
      }
    })

    // Total schema loads should be 1 (only the initial PageList call)
    expect(schemaLoadCallCount).toBe(1)
    expect(mockLoadSchema).toHaveBeenCalledOnce()
    expect(mockLoadSchema).toHaveBeenCalledWith('groups')

    console.log('✅ Fix validation successful:')
    console.log(`  - PageList calls: 1`)
    console.log(`  - Form instances with schema prop: 8 (7 EditModals + 1 CreateModal)`)
    console.log(`  - Total schema load calls: ${schemaLoadCallCount}`)
    console.log(`  - Reduction: From 8+ calls to 1 call`)
  })
})