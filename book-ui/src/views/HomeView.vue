<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import AppShell from "../components/layout/AppShell.vue";
import AppSidebar from "../components/layout/AppSidebar.vue";
import StatCard from "../components/dashboard/StatCard.vue";
import ProgressBar from "../components/common/ProgressBar.vue";
import { getBooks, type Book } from "../services/books";
import { getYearlyReadingGoal } from "../services/auth";

const books = ref<Book[]>([]);
const loading = ref(false);
const error = ref("");

const yearlyGoal = ref(getYearlyReadingGoal() ?? 12);

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

const booksFinishedThisMonth = computed(() =>
  books.value.filter(
    (book) => book.status === "finished" && isThisMonth(book.finishedAt)
  ).length
);

const booksFinishedThisYear = computed(() =>
  books.value.filter(
    (book) => book.status === "finished" && isThisYear(book.finishedAt)
  ).length
);

const currentlyReading = computed(() =>
  books.value.filter((book) => book.status === "currently-reading")
);

const wantToRead = computed(() =>
  books.value.filter((book) => book.status === "want-to-read")
);

const recentlyFinished = computed(() =>
  [...books.value]
    .filter((book) => book.status === "finished" && book.finishedAt)
    .sort(
      (a, b) =>
        new Date(b.finishedAt || "").getTime() -
        new Date(a.finishedAt || "").getTime()
    )
    .slice(0, 5)
);

const yearlyGoalPercent = computed(() => {
  if (!yearlyGoal.value || yearlyGoal.value <= 0) return 0;
  return Math.round((booksFinishedThisYear.value / yearlyGoal.value) * 100);
});

function progressPercent(current: number, total: number) {
  if (!total) return 0;
  return Math.round((current / total) * 100);
}

function bookCoverColor(index: number) {
  const colors = ["#7E9776", "#C6A22E", "#C77A45", "#8B7E74"];
  return colors[index % colors.length];
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
        <h1 class="hero__title">Your Reading Nook</h1>
        <p class="hero__subtitle">
          Welcome back — here's your reading snapshot.
        </p>
      </header>

      <p v-if="error" class="error" role="alert">
        {{ error }}
      </p>

      <section v-if="!loading" class="stats-grid">
        <StatCard label="Books this month" :value="booksFinishedThisMonth" />
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

        <div v-if="loading" class="empty-state">
          Loading books...
        </div>

        <div v-else-if="currentlyReading.length" class="reading-grid">
          <article
            v-for="(book, index) in currentlyReading"
            :key="book._id"
            class="reading-card"
          >
            <div
              class="reading-card__cover"
              :style="{ background: bookCoverColor(index) }"
            >
              <div class="reading-card__cover-title">{{ book.title }}</div>
              <div class="reading-card__cover-author">{{ book.author }}</div>
            </div>

            <div class="reading-card__content">
              <h3 class="reading-card__title">{{ book.title }}</h3>
              <p class="reading-card__author">{{ book.author }}</p>

              <div class="reading-card__meta">
                <span>Page {{ book.currentPage }} of {{ book.totalPages }}</span>
                <span>{{ progressPercent(book.currentPage, book.totalPages) }}%</span>
              </div>

              <ProgressBar :value="book.currentPage" :max="book.totalPages" />

              <p v-if="book.targetDate" class="reading-card__deadline">
                Deadline: {{ new Date(book.targetDate).toLocaleDateString() }}
              </p>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          You do not have any books in progress yet.
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-head">
          <h2 class="section-title">Recently Finished</h2>
        </div>

        <div v-if="loading" class="empty-state">
          Loading finished books...
        </div>

        <div v-else-if="recentlyFinished.length" class="session-list">
          <article
            v-for="(book, index) in recentlyFinished"
            :key="book._id"
            class="session-item"
          >
            <div
              class="session-item__cover"
              :style="{ background: bookCoverColor(index + 1) }"
            >
              <div class="session-item__cover-title">{{ book.title }}</div>
              <div class="session-item__cover-author">{{ book.author }}</div>
            </div>

            <div class="session-item__main">
              <h3 class="session-item__title">{{ book.title }}</h3>
              <p class="session-item__date">
                Finished:
                {{
                  book.finishedAt
                    ? new Date(book.finishedAt).toLocaleDateString()
                    : "-"
                }}
              </p>
            </div>

            <div class="session-item__stats">
              <strong>{{ book.totalPages }} pages</strong>
              <span>{{ book.genre }}</span>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          No finished books yet.
        </div>
      </section>
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

.reading-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.reading-card {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 16px;
  padding: 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.reading-card__cover {
  min-height: 124px;
  border-radius: 14px;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.reading-card__cover-title {
  font-size: 0.95rem;
  line-height: 1.05;
  font-weight: 700;
}

.reading-card__cover-author {
  margin-top: 6px;
  font-size: 0.72rem;
  opacity: 0.9;
}

.reading-card__content {
  display: grid;
  align-content: start;
  gap: 10px;
}

.reading-card__title {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.1;
  color: var(--text);
  font-family: ui-serif, Georgia, Cambria, serif;
}

.reading-card__author {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.95rem;
}

.reading-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-soft);
  font-size: 0.88rem;
}

.reading-card__deadline {
  margin: 0;
  color: var(--accent);
  font-size: 0.9rem;
  font-weight: 600;
}

.session-list {
  display: grid;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.session-item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
}

.session-item + .session-item {
  border-top: 1px solid var(--border);
}

.session-item__cover {
  width: 56px;
  height: 78px;
  border-radius: 12px;
  padding: 8px 7px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.session-item__cover-title {
  font-size: 0.72rem;
  line-height: 1.02;
  font-weight: 700;
}

.session-item__cover-author {
  margin-top: 4px;
  font-size: 0.58rem;
  opacity: 0.9;
}

.session-item__main {
  min-width: 0;
}

.session-item__title {
  margin: 0;
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
}

.session-item__date {
  margin: 4px 0 0;
  color: var(--text-soft);
  font-size: 0.88rem;
}

.session-item__stats {
  display: grid;
  justify-items: end;
  gap: 4px;
  color: var(--text-soft);
  font-size: 0.88rem;
}

.session-item__stats strong {
  color: var(--text);
  font-size: 0.95rem;
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

  .reading-grid {
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

  .reading-card {
    grid-template-columns: 80px 1fr;
  }

  .section-title {
    font-size: 1.55rem;
  }

  .session-item {
    grid-template-columns: 48px 1fr;
  }

  .session-item__stats {
    grid-column: 2;
    justify-items: start;
  }
}
</style>