import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import KelistrikanView from '../views/KelistrikanView.vue'
import TangkiView from '../views/TangkiView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/kelistrikan', name: 'kelistrikan', component: KelistrikanView },
    { path: '/tangki', name: 'tangki', component: TangkiView }
    // ... route lain ...
  ]
})

export default router
