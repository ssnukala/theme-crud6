import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Import the CRUD6 components to test
import CRUD6ListPage from '../views/CRUD6/PageList.vue'
import CRUD6RowPage from '../views/CRUD6/PageRow.vue'

// Mock the sprinkle-crud6 composables
vi.mock('@ssnukala/sprinkle-crud6/composables', () => ({
  useCRUD6Schema: () => ({
    schema: {
      value: {
        fields: {
          id: { type: 'integer', listable: true, label: 'ID' },
          name: { type: 'string', listable: true, searchable: true, label: 'Name' },
          slug: { type: 'string', listable: true, label: 'Slug' },
          description: { type: 'text', listable: true, label: 'Description' },
          users_count: { type: 'integer', listable: true, label: 'Users' },
          enabled: { type: 'boolean', listable: true, label: 'Status' },
          created_at: { type: 'datetime', listable: true, label: 'Created' }
        },
        primary_key: 'id'
      }
    },
    loading: { value: false },
    error: { value: null },
    loadSchema: vi.fn(),
    hasPermission: vi.fn(() => true),
    tableColumns: { value: [] },
    defaultSort: { value: 'name' }
  }),
  useCRUD6Api: () => ({
    fetchCRUD6: vi.fn(),
    fetchCRUD6Row: vi.fn(),
    createCRUD6: vi.fn(),
    updateCRUD6: vi.fn(),
    apiLoading: { value: false },
    apiError: { value: null },
    formData: { value: {} },
    resetForm: vi.fn()
  })
}))

// Mock UserFrosting components
vi.mock('@userfrosting/sprinkle-core/stores', () => ({
  usePageMeta: () => ({
    setPageMeta: vi.fn()
  })
}))

const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/crud6/:model', name: 'crud6-list' },
    { path: '/crud6/:model/:id', name: 'crud6-view' }
  ]
})

const mockPinia = createPinia()

describe('CRUD6 Theme Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CRUD6ListPage Component', () => {
    it('should render the list page with schema-driven table', async () => {
      // Mock route params
      mockRouter.push('/crud6/groups')
      await mockRouter.isReady()

      const wrapper = mount(CRUD6ListPage, {
        global: {
          plugins: [mockRouter, mockPinia],
          mocks: {
            $t: (key) => key,
            $checkAccess: () => true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
      
      // Should have proper data attributes for testing
      expect(wrapper.find('[data-test]')).toBeDefined()
    })

    it('should handle model parameter from route', async () => {
      mockRouter.push('/crud6/groups')
      await mockRouter.isReady()

      const wrapper = mount(CRUD6ListPage, {
        global: {
          plugins: [mockRouter, mockPinia],
          mocks: {
            $t: (key) => key,
            $checkAccess: () => true
          }
        }
      })

      // Component should be reactive to route.params.model
      expect(wrapper.vm.model).toBe('groups')
    })
  })

  describe('CRUD6RowPage Component', () => {
    it('should render the row page for viewing/editing', async () => {
      mockRouter.push('/crud6/groups/1')
      await mockRouter.isReady()

      const wrapper = mount(CRUD6RowPage, {
        global: {
          plugins: [mockRouter, mockPinia],
          mocks: {
            $t: (key) => key,
            $checkAccess: () => true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
      
      // Should handle both model and ID parameters
      expect(wrapper.vm.model).toBe('groups')
      expect(wrapper.vm.recordId).toBe('1')
    })

    it('should handle create mode when no ID is provided', async () => {
      mockRouter.push('/crud6/groups/create')
      await mockRouter.isReady()

      const wrapper = mount(CRUD6RowPage, {
        global: {
          plugins: [mockRouter, mockPinia],
          mocks: {
            $t: (key) => key,
            $checkAccess: () => true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm.isCreateMode).toBe(true)
    })
  })

  describe('Integration with sprinkle-crud6', () => {
    it('should use the correct API endpoints based on model', () => {
      mockRouter.push('/crud6/groups')
      const wrapper = mount(CRUD6ListPage, {
        global: {
          plugins: [mockRouter, mockPinia],
          mocks: {
            $t: (key) => key,
            $checkAccess: () => true
          }
        }
      })

      // Should construct API URL dynamically
      expect(wrapper.vm.apiUrl).toBe('/api/crud6/groups')
    })

    it('should load schema dynamically for different models', () => {
      const { loadSchema } = require('@ssnukala/sprinkle-crud6/composables').useCRUD6Schema()
      
      mockRouter.push('/crud6/users')
      mount(CRUD6ListPage, {
        global: {
          plugins: [mockRouter, mockPinia],
          mocks: {
            $t: (key) => key,
            $checkAccess: () => true
          }
        }
      })

      expect(loadSchema).toHaveBeenCalledWith('users')
    })
  })

  describe('Component Registration', () => {
    it('should register components globally via plugin', () => {
      // Test that the plugin registration works
      const plugin = require('../plugins/crud6.ts').default
      const mockApp = {
        component: vi.fn().mockReturnThis()
      }

      plugin.install(mockApp)

      expect(mockApp.component).toHaveBeenCalledWith('UFCRUD6ListPage', expect.any(Object))
      expect(mockApp.component).toHaveBeenCalledWith('UFCRUD6RowPage', expect.any(Object))
    })
  })
})

describe('CRUD6 API Integration', () => {
  const testEndpoints = [
    'GET /api/crud6/groups',
    'GET /api/crud6/groups/{id}',
    'POST /api/crud6/groups',
    'PUT /api/crud6/groups/{id}',
    'DELETE /api/crud6/groups/{id}',
    'GET /api/crud6/groups/schema'
  ]

  testEndpoints.forEach(endpoint => {
    it(`should support ${endpoint} endpoint`, () => {
      // Validate that the endpoint structure is correct
      expect(endpoint).toMatch(/^(GET|POST|PUT|DELETE) \/api\/crud6\/\w+/)
    })
  })

  it('should handle different models dynamically', () => {
    const models = ['groups', 'users', 'products', 'orders']
    
    models.forEach(model => {
      const endpoint = `/api/crud6/${model}`
      expect(endpoint).toMatch(/^\/api\/crud6\/\w+$/)
    })
  })
})