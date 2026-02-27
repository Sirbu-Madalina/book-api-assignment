<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Book } from "../services/books";
import { getBooks, createBook, deleteBook } from "../services/books";
import { isLoggedIn } from "../services/auth";

const books = ref<Book[]>([]);
const error = ref("");
const loading = ref(false);

const query = ref("");
const showAdd = ref(false);

const form = ref<Book>({
  title: "",
  author: "",
  image: "",
  description: "",
  publishedYear: new Date().getFullYear(),
  genre: "",
  price: 0,
  inStock: true,
});

async function load() {
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

async function addBook() {
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

    form.value = {
      title: "",
      author: "",
      image: "",
      description: "",
      publishedYear: new Date().getFullYear(),
      genre: "",
      price: 0,
      inStock: true,
    };

    showAdd.value = false;
  } catch (e: any) {
    error.value = e?.message || "Could not add the book. Please try again.";
  } finally {
    loading.value = false;
  }
}

async function removeBook(id?: string) {
  if (!id) return;
  try {
    await deleteBook(id);
    books.value = books.value.filter((b) => b._id !== id);
  } catch (e: any) {
    error.value = e?.message || "Failed to delete book";
  }
}

const filteredBooks = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return books.value;

  return books.value.filter((b) => {
    const hay = `${b.title ?? ""} ${b.author ?? ""} ${b.genre ?? ""}`.toLowerCase();
    return hay.includes(q);
  });
});

const countLabel = computed(() => {
  const n = filteredBooks.value.length;
  return `${n} book${n === 1 ? "" : "s"} in your library`;
});

const coverFallback =
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=60";

function openAdd() {
  error.value = "";
  formError.value = "";
  showAdd.value = true;
}

function closeAdd() {
  formError.value = "";
  showAdd.value = false;
}

function onBackdrop(e: MouseEvent) {
  if (e.target === e.currentTarget) closeAdd();
}

const formError = ref("");

function validateForm(): boolean {
  formError.value = "";

  const titleOk = form.value.title?.trim().length > 0;
  const authorOk = form.value.author?.trim().length > 0;
  const genreOk = form.value.genre?.trim().length > 0;
  const yearOk = Number.isFinite(form.value.publishedYear) && form.value.publishedYear > 0;
  const descOk = form.value.description?.trim().length > 0;

  if (!titleOk || !authorOk || !genreOk || !yearOk || !descOk) {
    const missing: string[] = [];
    if (!titleOk) missing.push("Title");
    if (!authorOk) missing.push("Author");
    if (!genreOk) missing.push("Genre");
    if (!yearOk) missing.push("Year");
    if (!descOk) missing.push("Description");

    formError.value =
      `Please fill in the required fields: ${missing.join(", ")}. ` +
      `Image URL is optional.`;

    return false;
  }

  return true;
}

onMounted(load);
</script>

<template>
  <section class="page">
    <!-- Header -->
    <header class="hero">
      <h1 class="hero__title">Your Collection</h1>
      <p class="hero__sub">
        <span v-if="loading">Loading…</span>
        <span v-else>{{ countLabel }}</span>
      </p>
    </header>

    <!-- Controls -->
    <div class="controls">
      <div class="search">
        <span class="search__icon" aria-hidden="true">🔎</span>
        <input
          class="search__input"
          v-model="query"
          placeholder="Search by title, author, or genre..."
          type="text"
        />
      </div>

      <button class="btn btn--primary" @click="openAdd">＋ Add Book</button>
    </div>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <!-- Grid -->
    <div class="grid">
      <article class="card" v-for="b in filteredBooks" :key="b._id">
        <div class="card__cover">
          <img
            class="card__img"
            :src="b.image || coverFallback"
            :alt="b.title || 'Book cover'"
            loading="lazy"
          />

          <button
            v-if="isLoggedIn()"
            class="card__delete"
            type="button"
            @click="removeBook(b._id)"
            title="Delete"
          >
            Delete
          </button>
        </div>

        <h3 class="card__title">{{ b.title }}</h3>
        <p class="card__author">{{ b.author }}</p>

        <div class="card__meta">
          <span v-if="b.genre" class="pill">{{ b.genre }}</span>
          <span v-if="b.publishedYear" class="meta">{{ b.publishedYear }}</span>
          <span v-if="b.price != null" class="meta">€{{ b.price }}</span>
          <span v-if="b.inStock === false" class="pill pill--muted">Out of stock</span>
        </div>
      </article>

      <div v-if="!loading && filteredBooks.length === 0" class="empty">
        No books found.
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="showAdd" class="modal" @click="onBackdrop">
      <div class="modal__panel" role="dialog" aria-modal="true" aria-label="Add book">
        <div class="modal__head">
          <h2 class="modal__title">Add Book</h2>
          <button class="iconBtn" type="button" @click="closeAdd" aria-label="Close">
            ✕
          </button>
        </div>
     
        <p v-if="formError" class="formError" role="alert">{{ formError }}</p>

        <form class="form" @submit.prevent="addBook">
          <div class="field">
            <label class="label">Title</label>
            <input class="input" v-model.trim="form.title" required />
          </div>

          <div class="field">
            <label class="label">Author</label>
            <input class="input" v-model.trim="form.author" required />
          </div>

          <div class="field">
            <label class="label">Image URL</label>
            <input class="input" v-model.trim="form.image" placeholder="https://..." />
          </div>

          <div class="row">
            <div class="field">
              <label class="label">Genre</label>
              <input class="input" v-model.trim="form.genre" />
            </div>

            <div class="field">
              <label class="label">Year</label>
              <input class="input" type="number" v-model.number="form.publishedYear" />
            </div>
          </div>

          <div class="row">
            <div class="field">
              <label class="label">Price</label>
              <input class="input" type="number" step="0.01" v-model.number="form.price" />
            </div>

            <label class="check">
              <input type="checkbox" v-model="form.inStock" />
              <span>In stock</span>
            </label>
          </div>

          <div class="field">
            <label class="label">Description</label>
            <textarea class="textarea" v-model.trim="form.description"></textarea>
          </div>

          <div class="actions">
            <button class="btn btn--ghost" type="button" @click="closeAdd">Cancel</button>
            <button class="btn btn--primary" :disabled="loading" type="submit">
              {{ loading ? "Saving..." : "Add Book" }}
            </button>
          </div>
        </form>

        <p class="hint" v-if="!isLoggedIn()">
          You can fill the form, but you need to log in to save.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.formError {
  margin: 0 6px 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(180, 35, 24, 0.25);
  background: rgba(180, 35, 24, 0.08);
  color: #b42318;
  font-size: 13px;
  line-height: 1.45;
}

/* Page theme (matches your login palette) */
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

/* Hero */
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

/* Controls */
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

.btn--ghost:hover {
  background: rgba(31, 36, 48, 0.04);
}

.error {
  margin: 0 0 14px;
  color: var(--danger);
  font-size: 13px;
}

/* Grid like screenshot */
.grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}

.card {
  display: grid;
  gap: 10px;
}

.card__cover {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: rgba(31, 36, 48, 0.03);
  aspect-ratio: 1 / 1; /* square covers */
}

.card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card__delete {
  position: absolute;
  top: 10px;
  right: 10px;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(180, 35, 24, 0.25);
  background: rgba(180, 35, 24, 0.1);
  color: var(--danger);
  font-weight: 800;
  cursor: pointer;
}

.card__title {
  margin: 0;
  font-weight: 900;
  font-size: 16px;
  line-height: 1.2;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
}

.card__author {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.pill {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  color: rgba(31, 36, 48, 0.82);
}
.pill--muted {
  opacity: 0.7;
}

.meta {
  font-size: 12px;
  color: var(--muted);
}

.empty {
  grid-column: 1 / -1;
  padding: 22px;
  border-radius: 16px;
  border: 1px dashed var(--border);
  color: var(--muted);
}

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(31, 36, 48, 0.35);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 1000;
}

.modal__panel {
  width: min(560px, 94vw);
  background: #f7f3ee;
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(31, 36, 48, 0.25);
  padding: 16px;
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 6px 12px;
}

.modal__title {
  margin: 0;
  font-size: 22px;
  font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
}

.iconBtn {
  height: 38px;
  width: 38px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
}

.form {
  display: grid;
  gap: 12px;
  padding: 4px 6px 10px;
}

.field {
  display: grid;
  gap: 7px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: end;
}

.label {
  font-size: 12px;
  font-weight: 800;
}

.input,
.textarea {
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.7);
  padding: 10px 12px;
  outline: none;
}

.textarea {
  min-height: 110px;
  resize: vertical;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.4);
  font-weight: 700;
  color: rgba(31, 36, 48, 0.85);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.hint {
  margin: 6px 8px 10px;
  font-size: 12px;
  color: var(--muted);
}

/* Responsive columns */
@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 860px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .row {
    grid-template-columns: 1fr;
  }
}
</style>