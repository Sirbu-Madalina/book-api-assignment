import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";
import LoginView from "./views/LoginView.vue";
import AdminView from "./views/AdminView.vue"; 
import { isLoggedIn } from "./services/auth";
import CartView from "./views/CartView.vue";
import FavoritesView from "./views/FavoritesView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView },
    { 
      path: "/login", 
      component: LoginView, 
      meta: { layout: "auth" } 
    },
    { 
      path: "/admin", 
      component: AdminView,

      meta: { requiresAuth: true } 
    },
    { 
      path: "/cart", 
      component: CartView 
    },
    { 
      path: "/favorites", 
      component: FavoritesView 
    },
  ],
});

router.beforeEach((to) => {
  const logged = isLoggedIn();

  if (to.meta.requiresAuth && !logged) {
    return "/login";
  }

  if (!logged && to.path === "/") {
    return "/login";
  }

  if (logged && to.path === "/login") {
    return "/";
  }

  return true;
});