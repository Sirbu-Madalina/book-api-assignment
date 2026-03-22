import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";
import LoginView from "./views/LoginView.vue";
import { isLoggedIn } from "./services/auth";
import FavoritesView from "./views/FavoritesView.vue";
import MyLibraryView from "./views/MyLibraryView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView },
    {
      path: "/login",
      component: LoginView,
      meta: { layout: "auth" },
    },
    {
      path: "/favorites",
      component: FavoritesView,
    },
    {
      path: "/library",
      name: "library",
      component: MyLibraryView,
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
