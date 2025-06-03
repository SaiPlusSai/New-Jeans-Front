import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import IngresarDocsView from '@/views/IngresarDocsView.vue'
import VerDocumentosView from '@/views/VerDocumentosView.vue'
import FavoritosView from '@/views/FavoritosView.vue'
import ReportesView from '@/views/ReportesView.vue'
import PropuestasView from '@/views/PropuestasView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/propuestas',
      name: 'propuestas',
      component: PropuestasView,
    },
    {
      path: '/TPS',
      name: 'TPS',
      component: IngresarDocsView,
    },
    {
      path: '/docs',
      name: 'docs',
      component: VerDocumentosView,
    },
    {
      path: '/favs',
      name: 'favs',
      component: FavoritosView,
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: ReportesView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
