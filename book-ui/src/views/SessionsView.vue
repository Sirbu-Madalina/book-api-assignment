<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  PhCalendarBlank,
  PhBookOpen,
  PhClock,
  PhPencilSimple,
  PhPlus,
  PhTrash,
} from "@phosphor-icons/vue";

import AppShell from "../components/layout/AppShell.vue";
import AppSidebar from "../components/layout/AppSidebar.vue";
import SessionFormModal from "../components/SessionFormModal.vue";
import { getBooks, type Book } from "../services/books";
import {
  createReadingSession,
  deleteReadingSession,
  getReadingSessions,
  updateReadingSession,
  type ReadingSession,
} from "../services/sessions";

const books = ref<Book[]>([]);
const sessions = ref<ReadingSession[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const formError = ref("");
const showSessionModal = ref(false);
const showEditSessionModal = ref(false);

const selectedBookId = ref("");
const minutesRead = ref(30);
const pagesRead = ref(10);
const note = ref("");
const editingSessionId = ref<string | null>(null);
const editBookId = ref("");
const editMinutesRead = ref(0);
const editPagesRead = ref(0);
const editError = ref("");

const selectableBooks = computed(() =>
  books.value.filter((book) => book.status !== "finished")
);

const totalMinutes = computed(() =>
  sessions.value.reduce((sum, session) => sum + session.minutesRead, 0)
);

const totalPages = computed(() =>
  sessions.value.reduce((sum, session) => sum + session.pagesRead, 0)
);

const totalHoursLabel = computed(() => {
  const hours = Math.floor(totalMinutes.value / 60);
  const minutes = totalMinutes.value % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
});

const sessionsThisWeek = computed(() => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  return sessions.value.filter((session) => new Date(session.readAt) >= start)
    .length;
});

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatTime(dateString: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function resetForm() {
  minutesRead.value = 30;
  pagesRead.value = 10;
  note.value = "";
}

function openSessionModal() {
  formError.value = "";

  if (!selectedBookId.value && selectableBooks.value[0]?._id) {
    selectedBookId.value = selectableBooks.value[0]._id;
  }

  showSessionModal.value = true;
}

function closeSessionModal() {
  formError.value = "";
  showSessionModal.value = false;
}

async function loadSessionsPage() {
  loading.value = true;
  error.value = "";

  try {
    const [booksResult, sessionsResult] = await Promise.all([
      getBooks(),
      getReadingSessions(),
    ]);

    books.value = booksResult;
    sessions.value = sessionsResult;

    if (!selectedBookId.value && selectableBooks.value[0]?._id) {
      selectedBookId.value = selectableBooks.value[0]._id;
    }
  } catch (e: any) {
    error.value = e?.message || "Failed to load reading sessions.";
  } finally {
    loading.value = false;
  }
}

function replaceBook(updated: Book) {
  const index = books.value.findIndex((book) => book._id === updated._id);

  if (index >= 0) {
    books.value[index] = updated;
  }
}

function replaceBooks(updatedBooks: Book[]) {
  updatedBooks.forEach(replaceBook);
}

function replaceSession(updated: ReadingSession) {
  const index = sessions.value.findIndex((session) => session._id === updated._id);

  if (index >= 0) {
    sessions.value[index] = updated;
  }
}

async function saveSession() {
  formError.value = "";
  error.value = "";

  if (!selectedBookId.value) {
    formError.value = "Choose a book first.";
    return;
  }

  if (minutesRead.value < 0 || pagesRead.value < 0) {
    formError.value = "Values cannot be negative.";
    return;
  }

  if (minutesRead.value === 0 && pagesRead.value === 0) {
    formError.value = "Add minutes or pages before saving.";
    return;
  }

  saving.value = true;

  try {
    const result = await createReadingSession({
      bookId: selectedBookId.value,
      minutesRead: minutesRead.value,
      pagesRead: pagesRead.value,
      note: note.value.trim(),
    });

    sessions.value.unshift(result.session);
    replaceBook(result.book);
    resetForm();
    closeSessionModal();
  } catch (e: any) {
    formError.value = e?.message || "Could not save reading session.";
  } finally {
    saving.value = false;
  }
}

async function removeSession(session: ReadingSession) {
  if (!session._id) return;

  try {
    const result = await deleteReadingSession(session._id);
    sessions.value = sessions.value.filter((item) => item._id !== session._id);
    replaceBooks(result.books);
  } catch (e: any) {
    error.value = e?.message || "Could not delete reading session.";
  }
}

function startEditSession(session: ReadingSession) {
  if (!session._id) return;

  editingSessionId.value = session._id;
  editBookId.value = session.bookId._id ?? "";
  editMinutesRead.value = session.minutesRead;
  editPagesRead.value = session.pagesRead;
  editError.value = "";
  showEditSessionModal.value = true;
}

function cancelEditSession() {
  editingSessionId.value = null;
  editBookId.value = "";
  editMinutesRead.value = 0;
  editPagesRead.value = 0;
  editError.value = "";
  showEditSessionModal.value = false;
}

async function saveEditedSession() {
  if (!editingSessionId.value) return;

  editError.value = "";

  if (!editBookId.value) {
    editError.value = "Choose a book first.";
    return;
  }

  if (editMinutesRead.value < 0 || editPagesRead.value < 0) {
    editError.value = "Values cannot be negative.";
    return;
  }

  if (editMinutesRead.value === 0 && editPagesRead.value === 0) {
    editError.value = "Add minutes or pages before saving.";
    return;
  }

  saving.value = true;

  try {
    const result = await updateReadingSession(editingSessionId.value, {
      bookId: editBookId.value,
      minutesRead: editMinutesRead.value,
      pagesRead: editPagesRead.value,
    });

    replaceSession(result.session);
    replaceBooks(result.books);
    cancelEditSession();
  } catch (e: any) {
    editError.value = e?.message || "Could not update reading session.";
  } finally {
    saving.value = false;
  }
}

onMounted(loadSessionsPage);
</script>

<template>
  <AppShell>
    <template #sidebar>
      <AppSidebar />
    </template>

    <section class="sessions-page">
      <header class="hero">
        <div>
          <h1 class="hero__title">Reading Sessions</h1>
          <p class="hero__subtitle">
            Track reading time and review your session history.
          </p>
        </div>

        <button
          class="save-btn"
          type="button"
          :disabled="!selectableBooks.length"
          @click="openSessionModal"
        >
          <PhPlus :size="18" />
          Add session
        </button>
      </header>

      <p v-if="error" class="error" role="alert">
        {{ error }}
      </p>

      <div v-if="loading" class="empty-state">Loading sessions...</div>

      <template v-else>
        <section class="stats-grid">
          <article class="stat-card">
            <PhClock :size="22" class="stat-card__icon" />
            <span class="stat-card__label">Total time</span>
            <strong class="stat-card__value">{{ totalHoursLabel }}</strong>
          </article>

          <article class="stat-card">
            <PhBookOpen :size="22" class="stat-card__icon stat-card__icon--green" />
            <span class="stat-card__label">Pages logged</span>
            <strong class="stat-card__value">{{ totalPages }}</strong>
          </article>

          <article class="stat-card">
            <PhCalendarBlank
              :size="22"
              class="stat-card__icon stat-card__icon--accent"
            />
            <span class="stat-card__label">This week</span>
            <strong class="stat-card__value">{{ sessionsThisWeek }}</strong>
          </article>
        </section>

        <div v-if="!selectableBooks.length" class="empty-state">
          Add a book to your library before logging sessions.
        </div>

        <section class="sessions-section">
          <div class="section-head">
            <h2 class="section-title">Session History</h2>
          </div>

          <div v-if="sessions.length" class="session-list">
            <article
              v-for="session in sessions"
              :key="session._id"
              class="session-item"
            >
              <div class="session-item__main">
                <h3 class="session-item__title">
                  {{ session.bookId.title }}
                </h3>
                <p class="session-item__meta">
                  {{ formatDate(session.readAt) }} at
                  {{ formatTime(session.readAt) }}
                </p>
              </div>

              <div class="session-item__numbers">
                <span>{{ session.minutesRead }} min</span>
                <span>{{ session.pagesRead }} pages</span>
              </div>

              <div class="row-actions">
                <button
                  class="icon-btn"
                  type="button"
                  aria-label="Edit reading session"
                  @click="startEditSession(session)"
                >
                  <PhPencilSimple :size="17" />
                </button>

                <button
                  class="icon-btn"
                  type="button"
                  aria-label="Delete reading session"
                  @click="removeSession(session)"
                >
                  <PhTrash :size="17" />
                </button>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            No reading sessions yet.
          </div>
        </section>
      </template>

      <SessionFormModal
        v-model:open="showSessionModal"
        :books="selectableBooks"
        mode="add"
        :selected-book-id="selectedBookId"
        :minutes-read="minutesRead"
        :pages-read="pagesRead"
        :loading="saving"
        :error="formError"
        @update:selected-book-id="selectedBookId = $event"
        @update:minutes-read="minutesRead = $event"
        @update:pages-read="pagesRead = $event"
        @submit="saveSession"
        @close="closeSessionModal"
      />

      <SessionFormModal
        v-model:open="showEditSessionModal"
        :books="books"
        mode="edit"
        :selected-book-id="editBookId"
        :minutes-read="editMinutesRead"
        :pages-read="editPagesRead"
        :loading="saving"
        :error="editError"
        @update:selected-book-id="editBookId = $event"
        @update:minutes-read="editMinutesRead = $event"
        @update:pages-read="editPagesRead = $event"
        @submit="saveEditedSession"
        @close="cancelEditSession"
      />
    </section>
  </AppShell>
</template>

<style scoped>
.sessions-page {
  display: grid;
  gap: 24px;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.hero__title {
  margin: 0;
  font-size: 32px;
  line-height: 1.02;
  letter-spacing: 0;
  color: var(--text);
  font-family: ui-serif, Georgia, Cambria, serif;
}

.hero__subtitle {
  margin: 8px 0 0;
  color: var(--text-soft);
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.stat-card,
.session-list {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.stat-card {
  display: grid;
  gap: 8px;
  padding: 20px;
}

.stat-card__icon {
  color: #8f7d6d;
}

.stat-card__icon--green {
  color: var(--green);
}

.stat-card__icon--accent {
  color: var(--accent);
}

.stat-card__label {
  color: var(--text-soft);
  font-size: 0.92rem;
  font-weight: 700;
}

.stat-card__value {
  color: var(--text);
  font-family: ui-serif, Georgia, Cambria, serif;
  font-size: 2rem;
  line-height: 1;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.1;
  color: var(--text);
  font-family: ui-serif, Georgia, Cambria, serif;
}

.field {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.field__label {
  color: var(--text-soft);
  font-size: 0.9rem;
  font-weight: 800;
}

input,
select {
  width: 100%;
  height: 44px;
  padding: 0 13px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: white;
  color: var(--text);
  font: inherit;
  outline: none;
}

input:focus,
select:focus {
  border-color: rgba(126, 151, 118, 0.7);
  box-shadow: 0 0 0 4px rgba(126, 151, 118, 0.12);
}

.save-btn {
  min-width: 112px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: none;
  border-radius: 12px;
  background: var(--green);
  color: white;
  cursor: pointer;
  font-weight: 800;
}

.hero > .save-btn {
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 12px;
  white-space: nowrap;
}

.save-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

.sessions-section {
  display: grid;
  gap: 14px;
}

.session-list {
  display: grid;
  overflow: hidden;
}

.session-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 18px;
  align-items: center;
  padding: 18px 20px;
}

.session-item + .session-item {
  border-top: 1px solid var(--border);
}

.session-item__main {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.session-item__title {
  margin: 0;
  color: var(--text);
  font-size: 1.05rem;
}

.session-item__meta {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.92rem;
}

.session-item__numbers {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  color: var(--text);
  font-weight: 800;
}

.session-item__numbers span {
  padding: 7px 10px;
  border-radius: 999px;
  background: #efe9e1;
  white-space: nowrap;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #8f7d6d;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.icon-btn:hover {
  background: #f2ede6;
  color: #b42318;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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

.error--compact {
  padding: 11px 13px;
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
    grid-template-columns: 1fr;
  }

  .field--book,
  .field--note,
  .save-btn {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .hero,
  .session-item {
    grid-template-columns: 1fr;
  }

  .session-item__numbers {
    justify-content: flex-start;
  }
}
</style>
