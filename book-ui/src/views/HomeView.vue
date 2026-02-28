<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Book } from "../services/books";
import { getBooks, createBook, deleteBook, updateBook } from "../services/books";
import { isLoggedIn } from "../services/auth";
import BookCard from "../components/BookCard.vue";
import BookFormModal from "../components/BookFormModal.vue";

const books = ref<Book[]>([]);
const error = ref("");
const loading = ref(false);

const query = ref("");

// modal state
const showModal = ref(false);
const mode = ref<"create" | "edit">("create");
const editingId = ref<string | undefined>(undefined);

// form + formError (used inside modal)
const formError = ref("");
const form = ref<Book>(emptyForm());

function emptyForm(): Book {
  return {
    title: "",
    author: "",
    image: "",
    description: "", // optional
    publishedYear: new Date().getFullYear(),
    genre: "",
    price: 0,
    inStock: true,
  };
}

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

function openAdd() {
  error.value = "";
  formError.value = "";
  mode.value = "create";
  editingId.value = undefined;
  form.value = emptyForm();
  showModal.value = true;
}

function openEdit(book: Book) {
  error.value = "";
  formError.value = "";
  mode.value = "edit";
  editingId.value = book._id;

  form.value = {
    ...emptyForm(),
    ...book,
    // ensure strings are never undefined
    title: book.title ?? "",
    author: book.author ?? "",
    image: book.image ?? "",
    description: book.description ?? "",
    genre: book.genre ?? "",
    publishedYear: book.publishedYear ?? new Date().getFullYear(),
    price: book.price ?? 0,
    inStock: book.inStock ?? true,
  };

  showModal.value = true;
}

function closeModal() {
  formError.value = "";
  showModal.value = false;
}

function validateForm(): boolean {
  formError.value = "";

  const titleOk = form.value.title?.trim().length > 0;
  const authorOk = form.value.author?.trim().length > 0;
  const genreOk = form.value.genre?.trim().length > 0;
  const yearOk = Number.isFinite(form.value.publishedYear) && form.value.publishedYear > 0;
  const imageOk = form.value.image?.trim().length > 0;

  // description is OPTIONAL -> no check

  if (!titleOk || !authorOk || !genreOk || !yearOk || !imageOk) {
    const missing: string[] = [];
    if (!titleOk) missing.push("Title");
    if (!authorOk) missing.push("Author");
    if (!genreOk) missing.push("Genre");
    if (!yearOk) missing.push("Year");
    if (!imageOk) missing.push("Image URL");

    formError.value = `Please fill in: ${missing.join(", ")}. Description is optional.`;
    return false;
  }

  return true;
}

async function saveBook() {
  error.value = "";
  formError.value = "";

  if (!isLoggedIn()) {
    error.value = "Please sign in to save a book.";
    return;
  }

  if (!validateForm()) return;

  loading.value = true;
  try {
    if (mode.value === "create") {
      const created = await createBook(form.value);
      books.value.unshift(created);
    } else {
      if (!editingId.value) {
        throw new Error("Missing book id for edit.");
      }
      const updated = await updateBook(editingId.value, form.value);
      books.value = books.value.map((b) => (b._id === updated._id ? updated : b));
    }

    closeModal();
  } catch (e: any) {
    error.value = e?.message || "Could not save the book. Please try again.";
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
      <BookCard
        v-for="b in filteredBooks"
        :key="b._id"
        :book="b"
        :coverFallback="coverFallback"
        :canManage="isLoggedIn()"
        @delete="removeBook"
        @edit="openEdit"
      />

      <div v-if="!loading && filteredBooks.length === 0" class="empty">
        No books found.
      </div>
    </div>

    <!-- Modal (Add/Edit) -->
    <BookFormModal
      v-model:open="showModal"
      v-model="form"
      :mode="mode"
      :loading="loading"
      :error="formError"
      @submit="saveBook"
      @close="closeModal"
    />
  </section>
</template>

<style scoped>
/* keep your existing styles from old HomeView */
/* Page theme */
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

.error {
  margin: 0 0 14px;
  color: var(--danger);
  font-size: 13px;
}

/* Grid */
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

/* Responsive */
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