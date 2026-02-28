import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";
import LoginView from "./views/LoginView.vue";
import { isLoggedIn } from "./services/auth";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView },
    { path: "/login", component: LoginView, meta: { layout: "auth" } },
  ],
});

router.beforeEach((to) => {
  const logged = isLoggedIn();

  // if not logged in, block Home
  if (!logged && to.path === "/") return "/login";

  // if logged in, block login page
  if (logged && to.path === "/login") return "/";

  return true;
});