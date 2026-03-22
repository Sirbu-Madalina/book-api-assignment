<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Book, CreateBookInput } from "../services/books";
import { getBooks, createBook, updateBook } from "../services/books";
import { isLoggedIn } from "../services/auth";

import BookCard from "../components/BookCard.vue";
import BookFormModal from "../components/BookFormModal.vue";

const books = ref<Book[]>([]);
const error = ref("");
const loading = ref(false);
const query = ref("");

const showModal = ref(false);
const formError = ref("");

const form = ref<CreateBookInput>(emptyForm());

function emptyForm(): CreateBookInput {
  return {
    title: "",
    author: "",
    coverImage: "",
    description: "",
    genre: "",
    totalPages: 1,
    currentPage: 0,
    status: "want-to-read",
    targetDate: "",
    isFavorite: false,
  };
}

async function loadBooks() {
  error.value = "";
  loading.value = true;

  try {
    books.value = await getBooks();
  } catch (e: any) {
    error.value = e?.message || "Failed to load books";
  } finally {
    loading.value = false;
  }
}

function openAddModal() {
  error.value = "";
  formError.value = "";
  form.value = emptyForm();
  showModal.value = true;
}

function closeModal() {
  formError.value = "";
  showModal.value = false;
}

function validateForm(): boolean {
  formError.value = "";

  const missing: string[] = [];

  if (!form.value.title.trim()) missing.push("Title");
  if (!form.value.author.trim()) missing.push("Author");
  if (!form.value.coverImage.trim()) missing.push("Cover image");
  if (!form.value.genre.trim()) missing.push("Genre");
  if (!form.value.totalPages || form.value.totalPages < 1) missing.push("Total pages");

  if (missing.length > 0) {
    formError.value = `Please fill in: ${missing.join(", ")}.`;
    return false;
  }

  if ((form.value.currentPage ?? 0) > form.value.totalPages) {
    formError.value = "Current page cannot be greater than total pages.";
    return false;
  }

  return true;
}

async function saveBook() {
  error.value = "";
  formError.value = "";

  if (!isLoggedIn()) {
    error.value = "Please sign in to add a book.";
    return;
  }

  if (!validateForm()) return;

  loading.value = true;

  try {
    const created = await createBook(form.value);
    books.value.unshift(created);
    closeModal();
  } catch (e: any) {
    error.value = e?.message || "Could not save the book.";
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
    if (index >= 0) books.value[index] = updated;
  } catch (e: any) {
    error.value = e?.message || "Could not update favorite status.";
  }
}

const filteredBooks = computed(() => {
  const q = query.value.trim().toLowerCase();

  if (!q) return books.value;

  return books.value.filter((book) => {
    const haystack = `${book.title ?? ""} ${book.author ?? ""} ${book.genre ?? ""} ${book.status ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });
});

const countLabel = computed(() => {
  const n = filteredBooks.value.length;
  return `${n} book${n === 1 ? "" : "s"} in your tracker`;
});

onMounted(loadBooks);
</script>

<template>
  <section class="page">
    <header class="hero">
      <h1 class="hero__title">My Reading Tracker</h1>
      <p class="hero__sub">
        <span v-if="loading">Loading...</span>
        <span v-else>{{ countLabel }}</span>
      </p>
    </header>

    <div class="controls">
      <div class="search">
        <span class="search__icon" aria-hidden="true">🔎</span>
        <input
          v-model="query"
          class="search__input"
          type="text"
          placeholder="Search by title, author, genre, or status..."
        />
      </div>

      <button class="btn btn--primary" type="button" @click="openAddModal">
        ＋ Add Book
      </button>
    </div>

    <p v-if="error" class="error" role="alert">
      {{ error }}
    </p>

    <div class="grid">
      <BookCard
        v-for="book in filteredBooks"
        :key="book._id"
        :book="book"
        @toggle-favorite="toggleFavorite"
      />

      <div v-if="!loading && filteredBooks.length === 0" class="empty">
        No books found.
      </div>
    </div>

    <BookFormModal
      v-model:open="showModal"
      v-model="form"
      :loading="loading"
      :error="formError"
      @submit="saveBook"
      @close="closeModal"
    />
  </section>
</template>

<style scoped>
.page {
  --ink: #1f2430;
  --muted: rgba(31, 36, 48, 0.62);
  --border: rgba(31, 36, 48, 0.12);
  --accent: #e5971a;
  --accentHover: #d88b12;
  --danger: #b42318;
  color: var(--ink);
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
  color: var(--muted);
  font-size: 14px;
}

.controls {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0 18px;
}

.search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.35);
  border-radius: 14px;
  padding: 10px 12px;
}

.search__input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  font-size: 14px;
}

.btn {
  height: 42px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: transparent;
  font-weight: 800;
  cursor: pointer;
  color: var(--ink);
}

.btn--primary {
  background: var(--accent);
  border-color: transparent;
  color: white;
}

.btn--primary:hover {
  background: var(--accentHover);
}

.error {
  margin: 0 0 14px;
  color: var(--danger);
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px;
  align-items: start;
}

.empty {
  grid-column: 1 / -1;
  padding: 22px;
  border-radius: 16px;
  border: 1px dashed var(--border);
  color: var(--muted);
}

@media (max-width: 860px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>