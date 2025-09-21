/// <reference types="vite/client" />
/// <reference types="@userfrosting/sprinkle-core" />
/// <reference types="@userfrosting/sprinkle-account" />

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// UIKit type declarations
declare module 'uikit' {
    const UIkit: any
    export default UIkit
}

declare module 'uikit/dist/js/uikit-icons' {
    const Icons: any
    export default Icons
}