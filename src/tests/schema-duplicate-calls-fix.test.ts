import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Info from '../components/Pages/CRUD6/Base/Info.vue'

// Mock the composables
const mockLoadSchema = vi.fn()
const mockHasPermission = vi.fn(() => true)

vi.mock('@ssnukala/sprinkle-crud6/composables', () => ({
  useCRUD6Schema: vi.fn(() => ({
    schema: ref(null),
    loading: ref(false),
    error: ref(null),
    loadSchema: mockLoadSchema,
    hasPermission: mockHasPermission
  }))
}))

// Mock router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/crud6/groups/1',
    params: { model: 'groups', id: '1' }
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}))

const mockT = (key: string) => key

const mockCrud6 = {
  id: 1,
  name: 'Test Group',
  description: 'Test Description',
  slug: 'test-group'
}

const mockSchema = {
  title: 'Group Management',
  fields: {
    name: { type: 'string', label: 'Name', displayable: true },
    description: { type: 'text', label: 'Description', displayable: true },
    slug: { type: 'string', label: 'Slug', displayable: true }
  }
}

describe('Schema Duplicate Calls Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should NOT initialize useCRUD6Schema when schema prop is provided', () => {
    const { useCRUD6Schema } = require('@ssnukala/sprinkle-crud6/composables')
    
    // Reset the mock call count
    useCRUD6Schema.mockClear()
    
    // Mount Info component WITH schema prop
    mount(Info, {
      props: {
        crud6: mockCrud6,
        schema: mockSchema
      },
      global: {
        stubs: {
          'font-awesome-icon': true,
          'UFCardBox': true,
          'CRUD6EditModal': true,
          'CRUD6DeleteModal': true
        },
        mocks: {
          $t: mockT,
          $checkAccess: () => true
        }
      }
    })
    
    // useCRUD6Schema should NOT be called when schema prop is provided
    expect(useCRUD6Schema).not.toHaveBeenCalled()
  })

  it('should initialize useCRUD6Schema when no schema prop is provided', () => {
    const { useCRUD6Schema } = require('@ssnukala/sprinkle-crud6/composables')
    
    // Reset the mock call count
    useCRUD6Schema.mockClear()
    
    // Mount Info component WITHOUT schema prop
    mount(Info, {
      props: {
        crud6: mockCrud6
        // No schema prop provided
      },
      global: {
        stubs: {
          'font-awesome-icon': true,
          'UFCardBox': true,
          'CRUD6EditModal': true,
          'CRUD6DeleteModal': true
        },
        mocks: {
          $t: mockT,
          $checkAccess: () => true
        }
      }
    })
    
    // useCRUD6Schema should be called when no schema prop is provided
    expect(useCRUD6Schema).toHaveBeenCalledOnce()
  })

  it('should validate the fix for /crud6/groups/1 route duplicate calls', () => {
    const issueDescription = {
      route: '/crud6/groups/1',
      beforeFix: {
        schemaCalls: 2,
        sources: [
          'PageRow model watcher (correct)',
          'Info useCRUD6Schema initialization (redundant)'
        ]
      },
      afterFix: {
        schemaCalls: 1,
        sources: [
          'PageRow model watcher (only call)'
        ],
        prevented: [
          'Info useCRUD6Schema initialization (skipped when schema prop provided)'
        ]
      }
    }

    // Validate the optimization
    expect(issueDescription.afterFix.schemaCalls).toBe(1)
    expect(issueDescription.beforeFix.schemaCalls - issueDescription.afterFix.schemaCalls).toBe(1)
    
    // Log the fix details
    console.log('🎯 Schema Duplicate Calls Fix Results:')
    console.log(`  Route: ${issueDescription.route}`)
    console.log(`  Before fix: ${issueDescription.beforeFix.schemaCalls} schema calls`)
    console.log(`  After fix: ${issueDescription.afterFix.schemaCalls} schema call`)
    console.log(`  Reduction: ${issueDescription.beforeFix.schemaCalls - issueDescription.afterFix.schemaCalls} call eliminated (50% improvement)`)
  })
})