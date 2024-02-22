/*
main.ts -- Main entry point for the application.
Runs the Vue application and imports the necessary libraries.

Authors:
  Kyle Walker
*/

import { createApp } from 'vue'
import VNetworkGraph from 'v-network-graph'
import PrimeVue from 'primevue/config'
import Checkbox from 'primevue/checkbox'
import Slider from 'primevue/slider'
import App from './App.vue'

import 'v-network-graph/lib/style.css'
import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
const app = createApp(App)

app.use(VNetworkGraph)
app.use(PrimeVue)
app.component('PrimeCheckbox', Checkbox)
app.component('PrimeSlider', Slider)
app.mount('#app')
