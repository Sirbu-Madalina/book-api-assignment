<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { logout } from "../../services/auth";
import logoImg from "../../assets/logo.png";

// Phosphor icons
import {
  PhSquaresFour,
  PhBooks,
  PhTarget,
  PhTimer,
  PhBookmarkSimple,
  PhLock,
} from "@phosphor-icons/vue";

const router = useRouter();
const route = useRoute();

const menu = [
  { label: "Dashboard", path: "/", icon: PhSquaresFour },
  { label: "My Library", path: "/library", icon: PhBooks },
  { label: "Goals", path: "/goals", icon: PhTarget },
  {
    label: "Sessions",
    path: "/sessions",
    icon: PhTimer,
    disabled: true,
  },
  {
    label: "Bookshelves",
    path: "/bookshelves",
    icon: PhBookmarkSimple,
    disabled: true,
  },
];

function go(item: any) {
  if (item.disabled) return;
  router.push(item.path);
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
          :class="{
            active: route.path === item.path,
            disabled: item.disabled,
          }"
          @click="go(item)"
        >
          <div class="menu-left">
            <component :is="item.icon" size="20" weight="regular" />
            <span>{{ item.label }}</span>
          </div>

          <PhLock
            v-if="item.disabled"
            size="16"
            class="lock-icon"
          />
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
  padding: 32px 18px 24px;
}

.sidebar__top {
  display: grid;
  gap: 36px;
  flex: 1;
  align-content: start;
  min-height: 0;
}

.brand {
  display: grid;
  gap: 10px;
  padding-left: 4px;
}

.logo-img {
  width: 72px;
}

.logo-text {
  font-family: ui-serif, Georgia, serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
}

.menu {
  display: grid;
  gap: 10px;
}

.menu-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 14px;
  border-radius: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-soft);
  font-weight: 600;
  font-size: 0.98rem;
  transition: all 0.2s ease;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-item:hover:not(.disabled) {
  background: rgba(0, 0, 0, 0.045);
  color: var(--text);
  transform: translateX(2px);
}

.menu-item.active {
  background: #eae4dc;
  color: var(--text);
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lock-icon {
  opacity: 0.7;
}

.sidebar__bottom {
  margin-top: auto;
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
}

.logout-btn:hover {
  background: #f4efe8;
}
</style>