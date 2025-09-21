export default [
    {
        path: 'crud6/:model',
        meta: {
            auth: {},
            title: 'CRUD6.PAGE',
            description: 'CRUD6.PAGE_DESCRIPTION'
        },
        children: [
            {
                path: '',
                name: 'admin.crud6.list',
                meta: {
                    permission: {
                        slug: 'uri_crud6'
                    }
                },
                component: () => import('../views/CRUD6/PageList.vue')
            },
            {
                path: 'create',
                name: 'admin.crud6.create',
                meta: {
                    title: 'CRUD6.CREATE',
                    description: 'CRUD6.CREATE_PAGE',
                    permission: {
                        slug: 'uri_crud6'
                    }
                },
                component: () => import('../views/CRUD6/PageRow.vue')
            },
            {
                path: ':id',
                name: 'admin.crud6',
                meta: {
                    title: 'CRUD6.PAGE',
                    description: 'CRUD6.INFO_PAGE',
                    permission: {
                        slug: 'uri_crud6'
                    }
                },
                component: () => import('../views/CRUD6/PageRow.vue')
            },
            {
                path: ':id/edit',
                name: 'admin.crud6.edit',
                meta: {
                    title: 'CRUD6.EDIT',
                    description: 'CRUD6.EDIT_PAGE',
                    permission: {
                        slug: 'uri_crud6'
                    }
                },
                component: () => import('../views/CRUD6/PageRow.vue')
            }
        ]
    }
]