<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { PhPencilSimple, PhTarget, PhTrendUp } from "@phosphor-icons/vue";

import AppShell from "../components/layout/AppShell.vue";
import AppSidebar from "../components/layout/AppSidebar.vue";
import ProgressBar from "../components/common/ProgressBar.vue";

import { getBooks, type Book } from "../services/books";
import { getYearlyReadingGoal } from "../services/auth";

const books = ref<Book[]>([]);
const loading = ref(false);
const error = ref("");

// goals
const yearlyGoal = ref(getYearlyReadingGoal() ?? 24);
const monthlyGoal = ref(Number(localStorage.getItem("monthlyReadingGoal")) || 3);

// edit state
const isEditingYearlyGoal = ref(false);
const isEditingMonthlyGoal = ref(false);

const yearlyGoalInput = ref(yearlyGoal.value);
const monthlyGoalInput = ref(monthlyGoal.value);

async function loadBooks() {
  loading.value = true;
  error.value = "";

  try {
    books.value = await getBooks();
  } catch (e: any) {
    error.value = e?.message || "Failed to load goals data.";
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

function getDaysLeft(targetDate?: string) {
  if (!targetDate) return null;

  const today = new Date();
  const target = new Date(targetDate);

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const targetOnly = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );

  const diffMs = targetOnly.getTime() - todayOnly.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getProgressPercent(book: Book) {
  if (!book.totalPages || book.totalPages <= 0) return 0;
  return Math.min(100, Math.round(((book.currentPage ?? 0) / book.totalPages) * 100));
}

const booksFinishedThisYear = computed(() =>
  books.value.filter(
    (book) => book.status === "finished" && isThisYear(book.finishedAt),
  ).length,
);

const booksFinishedThisMonth = computed(() =>
  books.value.filter(
    (book) => book.status === "finished" && isThisMonth(book.finishedAt),
  ).length,
);

const booksWithDeadlines = computed(() =>
  [...books.value]
    .filter((book) => !!book.targetDate)
    .sort((a, b) => {
      const aTime = new Date(a.targetDate || "").getTime();
      const bTime = new Date(b.targetDate || "").getTime();
      return aTime - bTime;
    }),
);

function startEditYearlyGoal() {
  yearlyGoalInput.value = yearlyGoal.value;
  isEditingYearlyGoal.value = true;
}

function saveYearlyGoal() {
  if (!yearlyGoalInput.value || yearlyGoalInput.value < 1) return;

  yearlyGoal.value = yearlyGoalInput.value;
  localStorage.setItem("yearlyReadingGoal", String(yearlyGoal.value));
  isEditingYearlyGoal.value = false;
}

function startEditMonthlyGoal() {
  monthlyGoalInput.value = monthlyGoal.value;
  isEditingMonthlyGoal.value = true;
}

function saveMonthlyGoal() {
  if (!monthlyGoalInput.value || monthlyGoalInput.value < 1) return;

  monthlyGoal.value = monthlyGoalInput.value;
  localStorage.setItem("monthlyReadingGoal", String(monthlyGoal.value));
  isEditingMonthlyGoal.value = false;
}

onMounted(loadBooks);
</script>

<template>
  <AppShell>
    <template #sidebar>
      <AppSidebar />
    </template>

    <section class="goals-page">
      <header class="hero">
        <h1 class="hero__title">Reading Goals</h1>
        <p class="hero__subtitle">
          Set targets and track your reading progress.
        </p>
      </header>

      <p v-if="error" class="error" role="alert">
        {{ error }}
      </p>

      <div v-if="loading" class="empty-state">
        Loading goals...
      </div>

      <template v-else>
        <section class="goal-card">
          <div class="goal-card__head">
            <div class="goal-card__title-wrap">
              <PhTarget :size="20" class="goal-card__icon goal-card__icon--accent" />
              <h2 class="goal-card__title">Yearly Goal</h2>
            </div>

            <div class="goal-card__actions">
              <template v-if="isEditingYearlyGoal">
                <input
                  v-model.number="yearlyGoalInput"
                  type="number"
                  min="1"
                  class="goal-input"
                />
                <button class="icon-btn" type="button" @click="saveYearlyGoal">
                  ✓
                </button>
              </template>

              <button
                v-else
                class="icon-btn"
                type="button"
                aria-label="Edit yearly goal"
                @click="startEditYearlyGoal"
              >
                <PhPencilSimple :size="18" />
              </button>
            </div>
          </div>

          <div class="goal-card__value-row">
            <span class="goal-card__value">{{ booksFinishedThisYear }}</span>
            <span class="goal-card__value-text">/ {{ yearlyGoal }} books</span>
          </div>

          <ProgressBar :value="booksFinishedThisYear" :max="yearlyGoal" />

          <p class="goal-card__hint">
            {{ booksFinishedThisYear }} books finished in
            {{ new Date().getFullYear() }}
          </p>
        </section>

        <section class="goal-card">
          <div class="goal-card__head">
            <div class="goal-card__title-wrap">
              <PhTrendUp :size="20" class="goal-card__icon goal-card__icon--green" />
              <h2 class="goal-card__title">Monthly Goal</h2>
            </div>

            <div class="goal-card__actions">
              <template v-if="isEditingMonthlyGoal">
                <input
                  v-model.number="monthlyGoalInput"
                  type="number"
                  min="1"
                  class="goal-input"
                />
                <button class="icon-btn" type="button" @click="saveMonthlyGoal">
                  ✓
                </button>
              </template>

              <button
                v-else
                class="icon-btn"
                type="button"
                aria-label="Edit monthly goal"
                @click="startEditMonthlyGoal"
              >
                <PhPencilSimple :size="18" />
              </button>
            </div>
          </div>

          <div class="goal-card__value-row">
            <span class="goal-card__value">{{ booksFinishedThisMonth }}</span>
            <span class="goal-card__value-text">/ {{ monthlyGoal }} books</span>
          </div>

          <ProgressBar :value="booksFinishedThisMonth" :max="monthlyGoal" />

          <p class="goal-card__hint">
            {{ booksFinishedThisMonth }} books finished this month
          </p>
        </section>

        <section class="deadlines-section">
          <div class="section-head">
            <h2 class="section-title">Books with Deadlines</h2>
          </div>

          <div v-if="booksWithDeadlines.length" class="deadlines-list">
            <article
              v-for="book in booksWithDeadlines"
              :key="book._id"
              class="deadline-item"
            >
              <div class="deadline-item__main">
                <h3 class="deadline-item__title">{{ book.title }}</h3>
                <p class="deadline-item__author">{{ book.author }}</p>

                <div class="deadline-item__progress">
                  <ProgressBar
                    :value="book.currentPage ?? 0"
                    :max="book.totalPages"
                  />
                </div>
              </div>

              <div class="deadline-item__side">
                <strong
                  class="deadline-item__days"
                  :class="{
                    'deadline-item__days--late': (getDaysLeft(book.targetDate || '') ?? 0) < 0
                  }"
                >
                  <template v-if="(getDaysLeft(book.targetDate || '') ?? 0) > 0">
                    {{ getDaysLeft(book.targetDate || '') }} days left
                  </template>

                  <template v-else-if="(getDaysLeft(book.targetDate || '') ?? 0) === 0">
                    Due today
                  </template>

                  <template v-else>
                    Overdue
                  </template>
                </strong>

                <span class="deadline-item__percent">
                  {{ getProgressPercent(book) }}% done
                </span>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            No books with deadlines yet.
          </div>
        </section>
      </template>
    </section>
  </AppShell>
</template>

<style scoped>
.goals-page {
  display: grid;
  gap: 24px;
}

.hero {
  display: grid;
  gap: 8px;
}

.hero__title {
  font-size: clamp(2.4rem, 4vw, 3.8rem);
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

.goal-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 24px;
  display: grid;
  gap: 18px;
}

.goal-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.goal-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.goal-card__icon {
  flex-shrink: 0;
}

.goal-card__icon--accent {
  color: #d57a3d;
}

.goal-card__icon--green {
  color: #7e9776;
}

.goal-card__title {
  margin: 0;
  font-size: 1.9rem;
  line-height: 1.1;
  color: var(--text);
  font-family: ui-serif, Georgia, Cambria, serif;
}

.goal-card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.goal-input {
  width: 84px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: white;
  color: var(--text);
  font: inherit;
  outline: none;
  box-sizing: border-box;
}

.goal-input:focus {
  border-color: rgba(126, 151, 118, 0.7);
  box-shadow: 0 0 0 4px rgba(126, 151, 118, 0.12);
}

.goal-card__value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.goal-card__value {
  font-size: 2.2rem;
  line-height: 1;
  color: var(--text);
  font-weight: 700;
  font-family: ui-serif, Georgia, Cambria, serif;
}

.goal-card__value-text {
  color: var(--text-soft);
  font-size: 1rem;
}

.goal-card__hint {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.95rem;
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

.deadlines-section {
  display: grid;
  gap: 14px;
}

.deadlines-list {
  display: grid;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.deadline-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  padding: 18px 20px;
  align-items: center;
}

.deadline-item + .deadline-item {
  border-top: 1px solid var(--border);
}

.deadline-item__main {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.deadline-item__title {
  margin: 0;
  color: var(--text);
  font-size: 1.05rem;
  font-weight: 700;
}

.deadline-item__author {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.92rem;
}

.deadline-item__progress {
  margin-top: 8px;
}

.deadline-item__side {
  display: grid;
  justify-items: end;
  gap: 6px;
  min-width: 110px;
}

.deadline-item__days {
  color: #d57a3d;
  font-size: 0.95rem;
}

.deadline-item__days--late {
  color: #b42318;
}

.deadline-item__percent {
  color: var(--text-soft);
  font-size: 0.9rem;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border: none;
  background: transparent;
  color: #8f7d6d;
  border-radius: 10px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.18s ease, color 0.18s ease;
}

.icon-btn:hover {
  background: #f2ede6;
  color: #5c4436;
}

.empty-state {
  padding: 22px;
  border-radius: 16px;
  border: 1px dashed var(--border);
  background: rgba(255, 255, 255, 0.35);
  color: var(--text-soft);
}

@media (max-width: 760px) {
  .goal-card {
    padding: 18px;
  }

  .goal-card__title,
  .section-title {
    font-size: 1.55rem;
  }

  .deadline-item {
    grid-template-columns: 1fr;
  }

  .deadline-item__side {
    justify-items: start;
  }
}
</style>