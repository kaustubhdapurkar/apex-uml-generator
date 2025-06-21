import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import LoginView from '../views/Login.vue';
import Success from '../views/Success.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/apex-classes',
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
    },
    {
        path: '/api/oauth2/success',
        name: 'Success',
        component: Success,
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router; 