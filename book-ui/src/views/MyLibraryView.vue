<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AppShell from "../components/layout/AppShell.vue";
import AppSidebar from "../components/layout/AppSidebar.vue";
import BookCard from "../components/BookCard.vue";
import BookFormModal from "../components/BookFormModal.vue";
import type { Book, CreateBookInput, ReadingStatus } from "../services/books";
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} from "../services/books";
import { isLoggedIn } from "../services/auth";
import AddTimeModal from "../components/AddTimeModal.vue";

const books = ref<Book[]>([]);
const loading = ref(false);
const error = ref("");

const showModal = ref(false);
const formError = ref("");
const query = ref("");
const selectedStatus = ref<"all" | ReadingStatus>("all");

const showAddTimeModal = ref(false);
const addTimeError = ref("");
const selectedBookForTime = ref<Book | null>(null);

const minutesRead = ref(0);
const pagesRead = ref(0);

const form = ref<CreateBookInput>(emptyForm());
const modalMode = ref<"add" | "edit">("add");
const editingBookId = ref<string | null>(null);

function emptyForm(): CreateBookInput {
  return {
    title: "",
    author: "",
    coverImage: "",
    description: "",
    totalPages: 1,
    currentPage: 0,
    status: "want-to-read",
    targetDate: "",
    isFavorite: false,
  };
}

async function loadBooks() {
  loading.value = true;
  error.value = "";

  try {
    books.value = await getBooks();
  } catch (e: any) {
    error.value = e?.message || "Failed to load books.";
  } finally {
    loading.value = false;
  }
}

function openAddModal() {
  formError.value = "";
  modalMode.value = "add";
  editingBookId.value = null;
  form.value = emptyForm();
  showModal.value = true;
}

function openEditModal(book: Book) {
  if (!book._id) return;

  formError.value = "";
  modalMode.value = "edit";
  editingBookId.value = book._id;

  form.value = {
    title: book.title,
    author: book.author,
    coverImage: book.coverImage,
    description: book.description ?? "",
    totalPages: book.totalPages,
    currentPage: book.currentPage ?? 0,
    status: book.status,
    targetDate: book.targetDate ?? "",
    isFavorite: book.isFavorite ?? false,
  };

  showModal.value = true;
}

function closeModal() {
  formError.value = "";
  editingBookId.value = null;
  modalMode.value = "add";
  showModal.value = false;
}

function validateForm() {
  formError.value = "";

  const missing: string[] = [];

  if (!form.value.title.trim()) missing.push("Title");
  if (!form.value.author.trim()) missing.push("Author");
  if (!form.value.coverImage.trim()) missing.push("Cover image");
  if (!form.value.totalPages || form.value.totalPages < 1) {
    missing.push("Total pages");
  }

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
    error.value = "Please sign in to save a book.";
    return;
  }

  if (!validateForm()) return;

  loading.value = true;

  try {
    if (modalMode.value === "add") {
      const created = await createBook(form.value);
      books.value.unshift(created);
    } else if (modalMode.value === "edit" && editingBookId.value) {
      const updated = await updateBook(editingBookId.value, form.value);
      replaceBook(updated);
    }

    closeModal();
  } catch (e: any) {
    error.value = e?.message || "Could not save the book.";
  } finally {
    loading.value = false;
  }
}

function replaceBook(updated: Book) {
  const index = books.value.findIndex((b) => b._id === updated._id);
  if (index >= 0) {
    books.value[index] = updated;
  }
}

async function handleDeleteBook(book: Book) {
  if (!book._id) return;

  try {
    await deleteBook(book._id);
    books.value = books.value.filter((b) => b._id !== book._id);
  } catch (e: any) {
    error.value = e?.message || "Could not delete the book.";
  }
}

async function handleCycleStatus(book: Book) {
  if (!book._id) return;

  let nextStatus: ReadingStatus = "want-to-read";
  let updateData: Partial<CreateBookInput> = {};

  if (book.status === "want-to-read") {
    nextStatus = "currently-reading";
    updateData = {
      status: nextStatus,
      startedAt: new Date().toISOString(),
      currentPage: book.currentPage ?? 0,
    };
  } else if (book.status === "currently-reading") {
    nextStatus = "finished";
    updateData = {
      status: nextStatus,
      currentPage: book.totalPages,
      finishedAt: new Date().toISOString(),
    };
  } else {
    nextStatus = "want-to-read";
    updateData = {
      status: nextStatus,
      currentPage: 0,
    };
  }

  try {
    const updated = await updateBook(book._id, updateData);
    replaceBook(updated);
  } catch (e: any) {
    error.value = e?.message || "Could not update book status.";
  }
}

const filteredBooks = computed(() => {
  const q = query.value.trim().toLowerCase();

  return books.value.filter((book) => {
    const matchesSearch =
      !q || `${book.title} ${book.author}`.toLowerCase().includes(q);

    const matchesStatus =
      selectedStatus.value === "all" || book.status === selectedStatus.value;

    return matchesSearch && matchesStatus;
  });
});

function openAddTimeModal(book: Book) {
  selectedBookForTime.value = book;
  minutesRead.value = 0;
  pagesRead.value = 0;
  addTimeError.value = "";
  showAddTimeModal.value = true;
}

function closeAddTimeModal() {
  selectedBookForTime.value = null;
  minutesRead.value = 0;
  pagesRead.value = 0;
  addTimeError.value = "";
  showAddTimeModal.value = false;
}

async function saveAddTime() {
  const currentBook = selectedBookForTime.value;

  if (!currentBook || !currentBook._id) return;

  if (pagesRead.value < 0 || minutesRead.value < 0) {
    addTimeError.value = "Values cannot be negative.";
    return;
  }

  const nextPage = (currentBook.currentPage ?? 0) + pagesRead.value;
  const clampedPage = Math.min(nextPage, currentBook.totalPages);

  try {
    const updated = await updateBook(currentBook._id, {
      currentPage: clampedPage,
      status:
        clampedPage >= currentBook.totalPages
          ? "finished"
          : "currently-reading",
      finishedAt:
        clampedPage >= currentBook.totalPages
          ? new Date().toISOString()
          : undefined,
    });

    replaceBook(updated);
    closeAddTimeModal();
  } catch (e: any) {
    addTimeError.value = e?.message || "Could not save reading session.";
  }
}

onMounted(loadBooks);
</script>

<template>
  <AppShell>
    <template #sidebar>
      <AppSidebar />
    </template>

    <section class="library">
      <header class="library__header">
        <div>
          <h1 class="library__title">My Library</h1>
          <p class="library__subtitle">
            {{ filteredBooks.length }} book{{
              filteredBooks.length === 1 ? "" : "s"
            }}
            in your collection
          </p>
        </div>

        <button class="add-btn" type="button" @click="openAddModal">
          + Add Book
        </button>
      </header>

      <p v-if="error" class="error" role="alert">
        {{ error }}
      </p>

      <section class="toolbar">
        <div class="search">
          <input v-model="query" type="text" placeholder="Search books..." />
        </div>

        <div class="filters">
          <button
            class="filter-btn"
            :class="{ active: selectedStatus === 'all' }"
            @click="selectedStatus = 'all'"
          >
            All
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedStatus === 'want-to-read' }"
            @click="selectedStatus = 'want-to-read'"
          >
            Want to Read
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedStatus === 'currently-reading' }"
            @click="selectedStatus = 'currently-reading'"
          >
            Currently Reading
          </button>
          <button
            class="filter-btn"
            :class="{ active: selectedStatus === 'finished' }"
            @click="selectedStatus = 'finished'"
          >
            Finished
          </button>
        </div>
      </section>

      <div v-if="loading" class="empty-state">Loading books...</div>

      <div v-else-if="filteredBooks.length" class="books-grid">
        <BookCard
          v-for="book in filteredBooks"
          :key="book._id"
          :book="book"
          @delete-book="handleDeleteBook"
          @edit-book="openEditModal"
          @cycle-status="handleCycleStatus"
          @add-time="openAddTimeModal"
        />
      </div>

      <div v-else class="empty-state">No books found.</div>

      <BookFormModal
        v-model:open="showModal"
        v-model="form"
        :loading="loading"
        :error="formError"
        :mode="modalMode"
        @submit="saveBook"
        @close="closeModal"
      />

      <AddTimeModal
        v-model:open="showAddTimeModal"
        :loading="loading"
        :error="addTimeError"
        :book-title="selectedBookForTime?.title"
        :minutes-read="minutesRead"
        :pages-read="pagesRead"
        @update:minutesRead="minutesRead = $event"
        @update:pagesRead="pagesRead = $event"
        @submit="saveAddTime"
        @close="closeAddTimeModal"
      />
    </section>
  </AppShell>
</template>

<style scoped>
.library {
  display: grid;
  gap: 24px;
}

.library__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.library__title {
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
  color: var(--text);
  font-family: ui-serif, Georgia, Cambria, serif;
}

.library__subtitle {
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: 1rem;
}

.add-btn {
  padding: 13px 18px;
  border: none;
  border-radius: 14px;
  background: var(--green);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.toolbar {
  display: grid;
  gap: 14px;
}

.search input {
  width: 100%;
  max-width: 420px;
  padding: 13px 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: white;
  color: var(--text);
  outline: none;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn {
  padding: 10px 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: #efe9e1;
  color: var(--text);
  cursor: pointer;
  font-weight: 600;
}

.filter-btn.active {
  background: var(--green);
  color: white;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(320px, 1fr));
  gap: 18px;
  align-items: start;
}

.error {
  margin: 0;
  padding: 14px 16px;
  border-radius: 14px;
  background: #fef3f2;
  border: 1px solid #fecdca;
  color: #b42318;
  font-size: 0.92rem;
}

.empty-state {
  padding: 22px;
  border-radius: 16px;
  border: 1px dashed var(--border);
  background: rgba(255, 255, 255, 0.35);
  color: var(--text-soft);
}

@media (max-width: 1200px) {
  .books-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .library__header {
    flex-direction: column;
    align-items: stretch;
  }

  .add-btn {
    width: 100%;
  }

  .search input {
    max-width: none;
  }
}
</style>
