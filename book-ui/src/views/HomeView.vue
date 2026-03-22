<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Book } from "../services/books";
import { getBooks, createBook } from "../services/books";
import { isLoggedIn } from "../services/auth";

import BookCard from "../components/BookCard.vue";
import BookFormModal from "../components/BookFormModal.vue";

import { useCart } from "../composables/useCart";
import { useSavedBooks } from "../composables/useSavedBooks";

const books = ref<Book[]>([]);
const error = ref("");
const loading = ref(false);
const query = ref("");

// modal state
const showModal = ref(false);
const formError = ref("");

// composables
const { addToCart } = useCart();
const { toggleSave, isSaved } = useSavedBooks();

// form state
const form = ref<Book>(emptyForm());

function emptyForm(): Book {
  return {
    title: "",
    author: "",
    image: "",
    description: "",
    publishedYear: new Date().getFullYear(),
    genre: "",
    price: 0,
    stockQuantity: 0,
    inStock: false,
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

  const titleOk = form.value.title.trim().length > 0;
  const authorOk = form.value.author.trim().length > 0;
  const genreOk = form.value.genre.trim().length > 0;
  const imageOk = form.value.image.trim().length > 0;
  const yearOk =
    Number.isFinite(form.value.publishedYear) && form.value.publishedYear > 0;

  if (!titleOk || !authorOk || !genreOk || !imageOk || !yearOk) {
    const missing: string[] = [];

    if (!titleOk) missing.push("Title");
    if (!authorOk) missing.push("Author");
    if (!genreOk) missing.push("Genre");
    if (!imageOk) missing.push("Image URL");
    if (!yearOk) missing.push("Year");

    formError.value = `Please fill in: ${missing.join(", ")}.`;
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
    form.value.inStock = (form.value.stockQuantity || 0) > 0;

    const created = await createBook(form.value);
    books.value.unshift(created);

    closeModal();
  } catch (e: any) {
    error.value = e?.message || "Could not save the book.";
  } finally {
    loading.value = false;
  }
}

const filteredBooks = computed(() => {
  const q = query.value.trim().toLowerCase();

  if (!q) return books.value;

  return books.value.filter((book) => {
    const haystack = `${book.title ?? ""} ${book.author ?? ""} ${book.genre ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });
});

const countLabel = computed(() => {
  const n = filteredBooks.value.length;
  return `${n} book${n === 1 ? "" : "s"} in your library`;
});

onMounted(loadBooks);
</script>

<template>
  <section class="page">
    <header class="hero">
      <h1 class="hero__title">Your Collection</h1>
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
          placeholder="Search by title, author, or genre..."
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
        :saved="isSaved(book._id)"
        @add-to-cart="addToCart"
        @toggle-save="toggleSave"
      />

      <div v-if="!loading && filteredBooks.length === 0" class="empty">
        No books found.
      </div>
    </div>

    <BookFormModal
      v-model:open="showModal"
      v-model="form"
      mode="create"
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

.search__icon {
  opacity: 0.7;
  font-size: 14px;
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
  display: inline-flex;
  align-items: center;
  gap: 10px;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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

<style scoped>
.page {
  --bg: #f7f3ee;
  --ink: #1f2430;
  --muted: rgba(31, 36, 48, 0.62);
  --border: rgba(31, 36, 48, 0.12);
  --card: rgba(255, 255, 255, 0.55);
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

.search__icon {
  opacity: 0.7;
  font-size: 14px;
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
  display: inline-flex;
  align-items: center;
  gap: 10px;
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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