import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import KelistrikanView from '../views/KelistrikanView.vue'
import TangkiView from '../views/TangkiView.vue'
import SuhuView from '../views/SuhuView.vue'
import KontrolValveView from '../views/KontrolValveView.vue'
import KontrolPacView from '../views/KontrolPacView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/kelistrikan', name: 'kelistrikan', component: KelistrikanView },
    { path: '/tangki', name: 'tangki', component: TangkiView },
    { path: '/suhu', name: 'suhu', component: SuhuView },
    { path: '/valve', name: 'valve', component: KontrolValveView },
    { path: '/pac', name: 'pac', component: KontrolPacView }
    // ... route lain ...
  ]
})

export default router
