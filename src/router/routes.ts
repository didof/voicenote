import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'new',
        component: () => import('pages/IndexPage.vue'),
      },

      {
        path: 'archive',
        name: 'archive',
        component: () => import('pages/ArchivePage.vue'),
      },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    name: 'error-not-found',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
