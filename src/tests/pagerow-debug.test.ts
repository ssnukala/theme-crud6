import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PageRow from '../views/CRUD6/PageRow.vue'

// Mock router
const mockRoute = {
  params: { model: 'groups', id: '1' },
  name: 'crud6-row'
}

const mockRouter = {
  push: vi.fn()
}

// Track schema loading calls with detailed info
let schemaLoadCallCount = 0
const schemaLoadCalls: Array<{ callNumber: number, model: string }> = []

const mockLoadSchema = vi.fn().mockImplementation((model: string) => {
  schemaLoadCallCount++
  const callInfo = {
    callNumber: schemaLoadCallCount,
    model: model
  }
  schemaLoadCalls.push(callInfo)
  console.log(`📞 Schema load call #${schemaLoadCallCount} for model: ${model}`)
  return Promise.resolve()
})

// Mock the composables
vi.mock('@ssnukala/sprinkle-crud6/composables', () => ({
  useCRUD6Api: () => ({
    fetchCRUD6: vi.fn(),
    fetchCRUD6Row: vi.fn().mockResolvedValue({ data: { id: 1, name: 'Test Group' } }),
    createCRUD6: vi.fn(),
    updateCRUD6: vi.fn(),
    apiLoading: ref(false),
    apiError: ref(null),
    formData: ref({}),
    resetForm: vi.fn()
  }),
  useCRUD6Schema: () => ({
    schema: ref(null),
    loading: ref(false),
    error: ref(null),
    loadSchema: mockLoadSchema,
    hasPermission: vi.fn(() => true)
  })
}))

// Mock other dependencies
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter
}))

vi.mock('@userfrosting/sprinkle-core/stores', () => ({
  usePageMeta: () => ({ title: ref('') })
}))

const mockT = (key: string) => key
const mockCheckAccess = vi.fn(() => true)

describe('PageRow Schema Loading Fix Validation', () => {
  beforeEach(() => {
    schemaLoadCallCount = 0
    schemaLoadCalls.length = 0
    vi.clearAllMocks()
  })

  it('should load schema exactly once with the optimized implementation', async () => {
    // Mount PageRow component
    console.log('🔍 Testing optimized PageRow component...')
    
    const wrapper = mount(PageRow, {
      global: {
        stubs: {
          'font-awesome-icon': true,
          'UFErrorPage': true,
          'CRUD6Info': {
            template: '<div>Mocked Info</div>',
            props: ['crud6', 'schema']
          },
          'CRUD6Users': {
            template: '<div>Mocked Users</div>',
            props: ['slug']
          }
        },
        mocks: {
          $t: mockT,
          $checkAccess: mockCheckAccess,
          $route: mockRoute
        }
      }
    })

    // Wait for async operations
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log('\n📊 Schema Loading Call Analysis (After Fix):')
    console.log(`Total calls made: ${schemaLoadCallCount}`)
    
    schemaLoadCalls.forEach((call, index) => {
      console.log(`Call ${call.callNumber}: Model ${call.model}`)
    })

    console.log(`\n✅ Fix validation: ${schemaLoadCallCount === 1 ? 'SUCCESS' : 'FAILED'}`)
    console.log(`🎯 Target: 1 call | Actual: ${schemaLoadCallCount} calls`)

    // Validate the fix
    expect(schemaLoadCallCount).toBe(1)
    expect(schemaLoadCalls[0].model).toBe('groups')
    expect(mockLoadSchema).toHaveBeenCalledOnce()
    expect(mockLoadSchema).toHaveBeenCalledWith('groups')
  })
})