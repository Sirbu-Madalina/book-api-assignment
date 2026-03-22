<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import BookCard from "../components/BookCard.vue";
import type { Book } from "../services/books";
import { getBooks, updateBook } from "../services/books";

const books = ref<Book[]>([]);
const loading = ref(false);
const error = ref("");

async function loadBooks() {
  error.value = "";
  loading.value = true;

  try {
    books.value = await getBooks();
  } catch (e: any) {
    error.value = e?.message || "Failed to load favorite books";
  } finally {
    loading.value = false;
  }
}

async function toggleFavorite(book: Book) {
  if (!book._id) return;

  try {
    const updated = await updateBook(book._id, {
      isFavorite: !book.isFavorite,
    });

    const index = books.value.findIndex((b) => b._id === book._id);
    if (index >= 0) {
      books.value[index] = updated;
    }
  } catch (e: any) {
    error.value = e?.message || "Could not update favorite status";
  }
}

const favoriteBooks = computed(() => books.value.filter((book) => book.isFavorite));

onMounted(loadBooks);
</script>

<template>
  <section class="page">
    <header class="hero">
      <h1 class="hero__title">Favorites</h1>
      <p class="hero__sub">
        <span v-if="loading">Loading...</span>
        <span v-else>
          {{ favoriteBooks.length }} favorite book{{ favoriteBooks.length === 1 ? "" : "s" }}
        </span>
      </p>
    </header>

    <p v-if="error" class="error" role="alert">
      {{ error }}
    </p>

    <div v-if="favoriteBooks.length" class="grid">
      <BookCard
        v-for="book in favoriteBooks"
        :key="book._id"
        :book="book"
        @toggle-favorite="toggleFavorite"
      />
    </div>

    <div v-else-if="!loading" class="empty">
      You have no favorite books yet.
    </div>
  </section>
</template>

<style scoped>
.page {
  color: #1f2430;
}

.hero {
  padding: 8px 0 18px;
}

.hero__title {
  margin: 0;
  font-size: 46px;
  letter-spacing: -0.03em;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
}

.hero__sub {
  margin: 6px 0 0;
  color: rgba(31, 36, 48, 0.62);
  font-size: 14px;
}

.error {
  margin: 0 0 14px;
  color: #b42318;
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
}

.empty {
  padding: 22px;
  border-radius: 16px;
  border: 1px dashed rgba(31, 36, 48, 0.12);
  color: rgba(31, 36, 48, 0.62);
}
</style>