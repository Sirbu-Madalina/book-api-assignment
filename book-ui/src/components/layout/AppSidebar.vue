<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { logout } from "../../services/auth";
import logoImg from "../../assets/logo.png";

const router = useRouter();
const route = useRoute();

const menu = [
  { label: "Dashboard", path: "/" },
  { label: "My Library", path: "/library" },
  { label: "Goals", path: "/goals" },
  { label: "Sessions", path: "/sessions" },
  { label: "Favorites", path: "/favorites" },
];

function go(path: string) {
  router.push(path);
}

function handleLogout() {
  logout();
  router.push("/login");
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__top">
      <div class="brand">
        <img :src="logoImg" alt="PageTurn logo" class="logo-img" />
        <span class="logo-text">PageTurn</span>
      </div>

      <nav class="menu">
        <button
          v-for="item in menu"
          :key="item.path"
          class="menu-item"
          :class="{ active: route.path === item.path }"
          @click="go(item.path)"
        >
          {{ item.label }}
        </button>
      </nav>
    </div>

    <div class="sidebar__bottom">
      <button class="logout-btn" type="button" @click="handleLogout">
        Logout
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 32px 18px 24px;
  background: transparent;
  overflow: hidden;
}

.sidebar__top {
  display: grid;
  gap: 36px;
  min-height: 0;
}

.brand {
  display: grid;
  justify-items: start;
  gap: 10px;
  padding-left: 4px;
}

.logo-img {
  width: 72px;
  height: auto;
  object-fit: contain;
  display: block;
}

.logo-text {
  font-family: ui-serif, Georgia, serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.menu {
  display: grid;
  gap: 10px;
}

.menu-item {
  width: 100%;
  text-align: left;
  padding: 13px 14px;
  border-radius: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-soft);
  font-weight: 600;
  font-size: 0.98rem;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.menu-item:hover {
  background: rgba(0, 0, 0, 0.045);
  color: var(--text);
  transform: translateX(2px);
}

.menu-item.active {
  background: #eae4dc;
  color: var(--text);
}

.sidebar__bottom {
  padding-top: 20px;
}

.logout-btn {
  width: 100%;
  padding: 13px 14px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: white;
  color: var(--text);
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.logout-btn:hover {
  background: #f4efe8;
  transform: translateY(-1px);
}
</style>