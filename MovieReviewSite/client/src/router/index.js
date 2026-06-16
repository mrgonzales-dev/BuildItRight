import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import MovieDetail from '../pages/MovieDetail.vue';
import MyReviews from '../pages/MyReviews.vue';
import Dashboard from '../pages/Dashboard.vue';
import NotFound from '../pages/NotFound.vue';

// Route definitions — each maps a URL path to a page component.
// meta.requiresAuth and meta.requiresOwner are checked by the navigation guard below.
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/movies/:id', name: 'MovieDetail', component: MovieDetail },
  {
    path: '/my-reviews',
    name: 'MyReviews',
    component: MyReviews,
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, requiresOwner: true },
  },
  // Catch-all 404 — must be last. The (:pathMatch(.*)*) regex matches any path.
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard — runs before every route transition.
// Checks localStorage for auth state and redirects if needed.
router.beforeEach((to, from, next) => {
  let user = null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      user = JSON.parse(stored);
    }
  } catch {
    localStorage.removeItem('user');
  }

  // Redirect to login if the route requires auth and user isn't logged in.
  if (to.meta.requiresAuth && !user) {
    return next({ name: 'Login' });
  }

  // Redirect to home if the route requires owner role and user isn't an owner.
  if (to.meta.requiresOwner && (!user || user.role !== 'owner')) {
    return next({ name: 'Home' });
  }

  next();
});

export default router;
