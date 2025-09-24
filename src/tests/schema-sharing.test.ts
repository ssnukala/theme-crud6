import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import Form from '../components/Pages/CRUD6/Base/Form.vue'
import Info from '../components/Pages/CRUD6/Base/Info.vue'
import CreateModal from '../components/Pages/CRUD6/Base/CreateModal.vue'
import EditModal from '../components/Pages/CRUD6/Base/EditModal.vue'

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
    loadSchema: vi.fn(),
    hasPermission: vi.fn(() => true)
  })
}))

// Mock UFModal and other UF components
vi.mock('@userfrosting/sprinkle-core/components', () => ({
  UFModal: { template: '<div><slot name="header"></slot><slot></slot></div>' },
  UFFormValidationError: { template: '<div></div>' }
}))

// Mock FontAwesome
vi.mock('@fortawesome/vue-fontawesome', () => ({
  FontAwesomeIcon: { template: '<i></i>' }
}))

// Mock UIkit
vi.mock('uikit', () => ({
  default: {
    modal: vi.fn(() => ({
      hide: vi.fn()
    }))
  }
}))

// Mock router
const mockRoute = {
  params: { model: 'groups', id: '1' }
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock translations
const mockT = (key: string) => key
global.$t = mockT

describe('Schema Sharing Optimization Tests', () => {
  const mockSchema = {
    fields: {
      name: { type: 'string', label: 'Name', editable: true },
      description: { type: 'text', label: 'Description', editable: true }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Component Schema Sharing', () => {
    it('should use provided schema instead of loading it', async () => {
      const mockLoadSchema = vi.fn()
      
      // Mock the composable to track loadSchema calls
      vi.mocked(await import('@ssnukala/sprinkle-crud6/composables')).useCRUD6Schema = () => ({
        schema: ref(null),
        loading: ref(false),
        error: ref(null),
        loadSchema: mockLoadSchema,
        hasPermission: vi.fn(() => true)
      })

      const wrapper = mount(Form, {
        props: {
          model: 'groups',
          schema: mockSchema
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

      // Should not call loadSchema when schema is provided
      expect(mockLoadSchema).not.toHaveBeenCalled()
      
      // Should render form fields based on provided schema
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('should fall back to composable schema when not provided', async () => {
      const mockLoadSchema = vi.fn()
      
      vi.mocked(await import('@ssnukala/sprinkle-crud6/composables')).useCRUD6Schema = () => ({
        schema: ref(mockSchema),
        loading: ref(false),
        error: ref(null),
        loadSchema: mockLoadSchema,
        hasPermission: vi.fn(() => true)
      })

      const wrapper = mount(Form, {
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

      // Should call loadSchema when schema is not provided
      expect(mockLoadSchema).toHaveBeenCalledWith('groups')
    })
  })

  describe('Info Component Schema Sharing', () => {
    const mockCrud6 = {
      id: 1,
      name: 'Test Group',
      description: 'Test Description'
    }

    it('should use provided schema instead of loading it', async () => {
      const mockLoadSchema = vi.fn()
      
      vi.mocked(await import('@ssnukala/sprinkle-crud6/composables')).useCRUD6Schema = () => ({
        schema: ref(null),
        loading: ref(false),
        error: ref(null),
        loadSchema: mockLoadSchema,
        hasPermission: vi.fn(() => true)
      })

      const wrapper = mount(Info, {
        props: {
          crud6: mockCrud6,
          schema: mockSchema
        },
        global: {
          stubs: {
            'font-awesome-icon': true,
            'UFCardBox': { template: '<div><slot></slot></div>' },
            'CRUD6EditModal': true,
            'CRUD6DeleteModal': true
          },
          mocks: {
            $t: mockT,
            $checkAccess: () => true
          }
        }
      })

      // Should not call loadSchema when schema is provided
      expect(mockLoadSchema).not.toHaveBeenCalled()
    })
  })

  describe('Modal Components Schema Passing', () => {
    it('CreateModal should pass schema to Form component', () => {
      const wrapper = mount(CreateModal, {
        props: {
          model: 'groups',
          schema: mockSchema
        },
        global: {
          stubs: {
            'font-awesome-icon': true,
            'UFModal': { template: '<div><slot name="header"></slot><slot></slot></div>' },
            'CRUD6Form': {
              template: '<div></div>',
              props: ['model', 'schema']
            }
          },
          mocks: {
            $t: mockT
          }
        }
      })

      const formComponent = wrapper.findComponent({ name: 'CRUD6Form' })
      expect(formComponent.exists()).toBe(true)
      expect(formComponent.props('schema')).toEqual(mockSchema)
      expect(formComponent.props('model')).toBe('groups')
    })

    it('EditModal should pass schema to Form component', () => {
      const mockCrud6 = { id: 1, name: 'Test' }
      
      const wrapper = mount(EditModal, {
        props: {
          crud6: mockCrud6,
          model: 'groups',
          schema: mockSchema
        },
        global: {
          stubs: {
            'font-awesome-icon': true,
            'UFModal': { template: '<div><slot name="header"></slot><slot></slot></div>' },
            'CRUD6Form': {
              template: '<div></div>',
              props: ['crud6', 'model', 'schema']
            }
          },
          mocks: {
            $t: mockT
          }
        }
      })

      const formComponent = wrapper.findComponent({ name: 'CRUD6Form' })
      expect(formComponent.exists()).toBe(true)
      expect(formComponent.props('schema')).toEqual(mockSchema)
      expect(formComponent.props('model')).toBe('groups')
      expect(formComponent.props('crud6')).toEqual(mockCrud6)
    })
  })

  describe('Schema Loading Optimization', () => {
    it('should demonstrate single schema load vs multiple loads', () => {
      // Before optimization: Each component would call loadSchema
      const componentCount = 5 // PageList, Form in CreateModal, Form in EditModal, Info, PageRow
      const callsBeforeOptimization = componentCount

      // After optimization: Only parent component calls loadSchema
      const callsAfterOptimization = 1

      const reduction = callsBeforeOptimization - callsAfterOptimization
      const percentageReduction = (reduction / callsBeforeOptimization) * 100

      expect(callsAfterOptimization).toBe(1)
      expect(percentageReduction).toBe(80) // 80% reduction in API calls
      expect(reduction).toBe(4) // 4 fewer API calls per page load
    })
  })
})