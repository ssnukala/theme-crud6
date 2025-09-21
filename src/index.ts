import type { App } from 'vue'

import CRUD6Sprinkle from './plugins/crud6'
/**
 * Import UIkit and its icons.
 */
import UIkit from 'uikit'
import Icons from 'uikit/dist/js/uikit-icons'
UIkit.use(Icons)

/**
 * Pink Cupcake Theme initialization recipe.
 *
 * This recipe is responsible for loading the Pink Cupcake, Admin, Account and
 * Core sprinkle plugins. It also load the FontAwesome icons.
 */
export default {
    install: (app: App) => {
        app.use(CRUD6Sprinkle)
        // Nothing to do here for now.
    }
}

// Export routes so they can be imported separately
export { default as CRUD6Routes } from './routes'
