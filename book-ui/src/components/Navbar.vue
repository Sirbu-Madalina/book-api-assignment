<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { isLoggedIn, logout } from "../services/auth";
import { PhSignOut, PhGear, PhHeartStraight, PhBooks } from "@phosphor-icons/vue";
import { getBooks } from "../services/books";
import { onMounted, ref } from "vue";
import type { Book } from "../services/books";

const router = useRouter();
const loggedIn = computed(() => isLoggedIn());
const books = ref<Book[]>([]);

const favoriteCount = computed(() => books.value.filter((b) => b.isFavorite).length);

async function loadBooks() {
  if (!loggedIn.value) return;

  try {
    books.value = await getBooks();
  } catch {
    books.value = [];
  }
}

function onLogout() {
  logout();
  router.push("/login");
}

onMounted(loadBooks);
</script>

<template>
  <header class="top">
    <div class="top__inner">
      <RouterLink to="/" class="brand-link">
        <h1 class="brand">Book Tracker</h1>
      </RouterLink>

      <div class="actions" v-if="loggedIn">
        <RouterLink to="/" class="btn-icon" title="My Books">
          <PhBooks :size="20" weight="regular" />
        </RouterLink>

        <RouterLink to="/favorites" class="btn-icon badge-wrap" title="Favorites">
          <PhHeartStraight :size="20" weight="regular" />
          <span v-if="favoriteCount" class="badge">{{ favoriteCount }}</span>
        </RouterLink>

        <RouterLink to="/admin" class="btn-icon" title="Dashboard">
          <PhGear :size="20" weight="regular" />
        </RouterLink>

        <button class="signout" type="button" @click="onLogout">
          <PhSignOut :size="18" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f7f3ee;
  border-bottom: 1px solid rgba(31, 36, 48, 0.12);
}

.top__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-link {
  text-decoration: none;
  color: inherit;
}

.brand {
  margin: 0;
  font-size: 22px;
  font-family: ui-serif, Georgia, Cambria, serif;
  color: #1f2430;
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-icon {
  position: relative;
  display: flex;
  color: #1f2430;
  padding: 10px;
  border-radius: 50%;
  transition: background 0.2s;
  text-decoration: none;
}

.btn-icon:hover {
  background: rgba(31, 36, 48, 0.08);
  color: #e5971a;
}

.badge-wrap {
  position: relative;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #e5971a;
  color: white;
  font-size: 11px;
  font-weight: 800;
  display: grid;
  place-items: center;
}

.signout {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(31, 36, 48, 0.18);
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
}
</style>