<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AppShell from "../components/layout/AppShell.vue";
import AppSidebar from "../components/layout/AppSidebar.vue";
import StatCard from "../components/dashboard/StatCard.vue";
import ProgressBar from "../components/common/ProgressBar.vue";
import BookCard from "../components/BookCard.vue";
import BookFormModal from "../components/BookFormModal.vue";
import AddTimeModal from "../components/AddTimeModal.vue";

import {
  getBooks,
  updateBook,
  deleteBook,
  type Book,
  type CreateBookInput,
  type ReadingStatus,
} from "../services/books";
import { getYearlyReadingGoal } from "../services/auth";

const books = ref<Book[]>([]);
const loading = ref(false);
const error = ref("");

const yearlyGoal = ref(getYearlyReadingGoal() ?? 12);
const monthlyGoal = ref(
  Number(localStorage.getItem("monthlyReadingGoal")) || 3,
);

// edit modal
const showModal = ref(false);
const formError = ref("");
const form = ref<CreateBookInput>(emptyForm());
const modalMode = ref<"add" | "edit">("edit");
const editingBookId = ref<string | null>(null);

// add time modal
const showAddTimeModal = ref(false);
const addTimeError = ref("");
const selectedBookForTime = ref<Book | null>(null);
const minutesRead = ref(0);
const pagesRead = ref(0);

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
    error.value = e?.message || "Failed to load dashboard data.";
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

function isThisMonth(dateString?: string) {
  if (!dateString) return false;

  const date = new Date(dateString);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function isThisYear(dateString?: string) {
  if (!dateString) return false;

  const date = new Date(dateString);
  const now = new Date();

  return date.getFullYear() === now.getFullYear();
}

const booksFinishedThisMonth = computed(
  () =>
    books.value.filter(
      (book) => book.status === "finished" && isThisMonth(book.finishedAt),
    ).length,
);

const booksFinishedThisYear = computed(
  () =>
    books.value.filter(
      (book) => book.status === "finished" && isThisYear(book.finishedAt),
    ).length,
);

const currentlyReading = computed(() =>
  books.value.filter((book) => book.status === "currently-reading"),
);

const wantToRead = computed(() =>
  books.value.filter((book) => book.status === "want-to-read"),
);

const recentlyFinished = computed(() =>
  [...books.value]
    .filter((book) => book.status === "finished" && book.finishedAt)
    .sort(
      (a, b) =>
        new Date(b.finishedAt || "").getTime() -
        new Date(a.finishedAt || "").getTime(),
    )
    .slice(0, 5),
);

const yearlyGoalPercent = computed(() => {
  if (!yearlyGoal.value || yearlyGoal.value <= 0) return 0;
  return Math.round((booksFinishedThisYear.value / yearlyGoal.value) * 100);
});

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
  showModal.value = false;
}

async function saveBook() {
  formError.value = "";

  if (!validateForm()) return;
  if (!editingBookId.value) return;

  loading.value = true;

  try {
    const updated = await updateBook(editingBookId.value, form.value);
    replaceBook(updated);
    closeModal();
  } catch (e: any) {
    formError.value = e?.message || "Could not save the book.";
  } finally {
    loading.value = false;
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

    <section class="dashboard">
      <header class="hero">
        <h1 class="hero__title">Your Reading Notebook</h1>
        <p class="hero__subtitle">
          Welcome back — here's your reading snapshot.
        </p>
      </header>

      <p v-if="error" class="error" role="alert">
        {{ error }}
      </p>

      <section v-if="!loading" class="stats-grid">
        <StatCard
          label="Books this month"
          :value="booksFinishedThisMonth"
          :hint="`Goal: ${monthlyGoal}`"
        />
        <StatCard
          label="Books this year"
          :value="booksFinishedThisYear"
          :hint="`Goal: ${yearlyGoal}`"
        />
        <StatCard label="Currently reading" :value="currentlyReading.length" />
        <StatCard label="Want to read" :value="wantToRead.length" />
      </section>

      <section v-if="!loading" class="panel goal-panel">
        <div class="section-head">
          <h2 class="section-title">Yearly Reading Goal</h2>
        </div>

        <div class="goal-copy">
          <span class="goal-copy__value">{{ booksFinishedThisYear }}</span>
          <span class="goal-copy__text">of {{ yearlyGoal }} books</span>
        </div>

        <ProgressBar :value="booksFinishedThisYear" :max="yearlyGoal" />

        <p class="goal-hint">{{ yearlyGoalPercent }}% complete</p>
      </section>

      <section class="dashboard-section">
        <div class="section-head">
          <h2 class="section-title">Currently Reading</h2>
        </div>

        <div v-if="loading" class="empty-state">Loading books...</div>

        <div v-else-if="currentlyReading.length" class="books-grid">
          <BookCard
            v-for="book in currentlyReading"
            :key="book._id"
            :book="book"
            @delete-book="handleDeleteBook"
            @edit-book="openEditModal"
            @cycle-status="handleCycleStatus"
            @add-time="openAddTimeModal"
          />
        </div>

        <div v-else class="empty-state">
          You do not have any books in progress yet.
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-head">
          <h2 class="section-title">Recently Finished</h2>
        </div>

        <div v-if="loading" class="empty-state">Loading finished books...</div>

        <div v-else-if="recentlyFinished.length" class="books-grid">
          <BookCard
            v-for="book in recentlyFinished"
            :key="book._id"
            :book="book"
            @delete-book="handleDeleteBook"
            @edit-book="openEditModal"
            @cycle-status="handleCycleStatus"
            @add-time="openAddTimeModal"
          />
        </div>

        <div v-else class="empty-state">No finished books yet.</div>
      </section>

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
.dashboard {
  display: grid;
  gap: 28px;
}

.hero {
  display: grid;
  gap: 8px;
}

.hero__title {
  font-size: clamp(2.5rem, 4vw, 4rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
  color: var(--text);
  font-family: ui-serif, Georgia, Cambria, serif;
}

.hero__subtitle {
  margin: 0;
  color: var(--text-soft);
  font-size: 1rem;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.goal-panel {
  padding: 22px 20px 18px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  font-size: 1.9rem;
  line-height: 1.1;
  color: var(--text);
  font-family: ui-serif, Georgia, Cambria, serif;
  letter-spacing: -0.03em;
}

.goal-copy {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 18px 0 14px;
}

.goal-copy__value {
  font-size: 2.2rem;
  line-height: 1;
  color: var(--text);
  font-weight: 700;
  font-family: ui-serif, Georgia, Cambria, serif;
}

.goal-copy__text {
  color: var(--text-soft);
  font-size: 1rem;
}

.goal-hint {
  margin: 10px 0 0;
  color: var(--text-soft);
  font-size: 0.9rem;
}

.dashboard-section {
  display: grid;
  gap: 14px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(320px, 1fr));
  gap: 18px;
  align-items: start;
}

.empty-state {
  padding: 22px;
  border-radius: 16px;
  border: 1px dashed var(--border);
  background: rgba(255, 255, 255, 0.35);
  color: var(--text-soft);
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .books-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .dashboard {
    gap: 22px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.55rem;
  }
}
</style>
