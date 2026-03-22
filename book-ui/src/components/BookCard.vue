<script setup lang="ts">
import { computed } from "vue";
import {
  PhHeartStraight,
  PhTrash,
  PhBookOpen,
  PhCheckCircle,
  PhArrowCounterClockwise,
} from "@phosphor-icons/vue";
import type { Book } from "../services/books";

const props = defineProps<{
  book: Book;
}>();

const emit = defineEmits<{
  (e: "toggle-favorite", book: Book): void;
  (e: "delete-book", book: Book): void;
  (e: "start-reading", book: Book): void;
  (e: "mark-finished", book: Book): void;
  (e: "start-over", book: Book): void;
}>();

const progressPercent = computed(() => {
  if (!props.book.totalPages || props.book.totalPages <= 0) return 0;
  const current = props.book.currentPage ?? 0;
  return Math.min(100, Math.round((current / props.book.totalPages) * 100));
});

const statusLabel = computed(() => {
  switch (props.book.status) {
    case "want-to-read":
      return "Want to Read";
    case "currently-reading":
      return "Currently Reading";
    case "finished":
      return "Finished";
    default:
      return props.book.status;
  }
});

const statusClass = computed(() => {
  switch (props.book.status) {
    case "want-to-read":
      return "status-badge--want";
    case "currently-reading":
      return "status-badge--reading";
    case "finished":
      return "status-badge--finished";
    default:
      return "";
  }
});

const actionLabel = computed(() => {
  switch (props.book.status) {
    case "want-to-read":
      return "Start reading →";
    case "currently-reading":
      return "Mark finished ✓";
    case "finished":
      return "Start over";
    default:
      return "";
  }
});

const actionClass = computed(() => {
  switch (props.book.status) {
    case "want-to-read":
      return "action-link--want";
    case "currently-reading":
      return "action-link--reading";
    case "finished":
      return "action-link--finished";
    default:
      return "";
  }
});

function handleMainAction() {
  switch (props.book.status) {
    case "want-to-read":
      emit("start-reading", props.book);
      break;
    case "currently-reading":
      emit("mark-finished", props.book);
      break;
    case "finished":
      emit("start-over", props.book);
      break;
  }
}
</script>

<template>
  <article class="book-card">
    <div class="book-cover-wrap">
      <img :src="book.coverImage" :alt="book.title" class="book-cover" />

      <button
        class="save-btn"
        :class="{ active: book.isFavorite }"
        type="button"
        @click="$emit('toggle-favorite', book)"
        aria-label="Toggle favorite"
      >
        <PhHeartStraight
          :size="16"
          :weight="book.isFavorite ? 'fill' : 'regular'"
        />
      </button>
    </div>

    <div class="book-content">
      <div class="book-header">
        <div class="book-heading">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">{{ book.author }}</p>
        </div>

        <button
          class="icon-btn delete-btn"
          type="button"
          @click="$emit('delete-book', book)"
          aria-label="Delete book"
        >
          <PhTrash :size="16" />
        </button>
      </div>

      <div class="book-meta">
        <span class="status-badge" :class="statusClass">
          <PhBookOpen v-if="book.status === 'want-to-read'" :size="13" />
          <PhBookOpen v-else-if="book.status === 'currently-reading'" :size="13" />
          <PhCheckCircle v-else :size="13" />
          {{ statusLabel }}
        </span>
      </div>

      <template v-if="book.status !== 'want-to-read'">
        <div class="progress-row">
          <span class="progress-text">
            p.{{ book.currentPage }}/{{ book.totalPages }}
          </span>
          <span class="progress-text">{{ progressPercent }}%</span>
        </div>

        <div class="progress">
          <div class="progress__bar" :style="{ width: `${progressPercent}%` }"></div>
        </div>
      </template>

      <button
        class="action-link"
        :class="actionClass"
        type="button"
        @click="handleMainAction"
      >
        <PhArrowCounterClockwise v-if="book.status === 'finished'" :size="14" />
        {{ actionLabel }}
      </button>

      <p v-if="book.targetDate && book.status !== 'finished'" class="target-date">
        Target: {{ new Date(book.targetDate).toLocaleDateString() }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.book-card {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 14px;
  background: var(--surface, #fff);
  border: 1px solid rgba(31, 36, 48, 0.08);
  border-radius: 18px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
  min-width: 0;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.08);
}

.book-cover-wrap {
  position: relative;
}

.book-cover {
  width: 88px;
  height: 124px;
  border-radius: 12px;
  object-fit: cover;
  display: block;
  background: #f4f1eb;
  border: 1px solid rgba(31, 36, 48, 0.06);
}

.save-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #344054;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  transition: transform 0.18s ease;
}

.save-btn:hover {
  transform: scale(1.05);
}

.save-btn.active {
  color: #c1121f;
}

.book-content {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding-top: 2px;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;
}

.book-heading {
  min-width: 0;
}

.book-title {
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.12;
  color: var(--text, #1f2430);
  font-family: ui-serif, Georgia, Cambria, serif;
  word-break: break-word;
}

.book-author {
  margin: 4px 0 0;
  color: var(--text-soft, #667085);
  font-size: 0.92rem;
}

.icon-btn {
  width: 30px;
  height: 30px;
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

.book-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge--want {
  background: #f5efe7;
  color: #5f5143;
}

.status-badge--reading {
  background: #e6efe2;
  color: #56724f;
}

.status-badge--finished {
  background: #eceee8;
  color: #5d6657;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.progress-text {
  font-size: 0.82rem;
  color: var(--text-soft, #667085);
}

.progress {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

.progress__bar {
  height: 100%;
  background: #7e9776;
  border-radius: inherit;
}

.action-link {
  width: fit-content;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.action-link--want {
  color: #6f9165;
}

.action-link--reading {
  color: #7e9776;
}

.action-link--finished {
  color: #7e9776;
}

.target-date {
  margin: 0;
  font-size: 0.82rem;
  color: #d57a3d;
  font-weight: 600;
}

@media (max-width: 760px) {
  .book-card {
    grid-template-columns: 78px 1fr;
    gap: 14px;
    padding: 14px;
  }

  .book-cover {
    width: 78px;
    height: 112px;
  }

  .book-title {
    font-size: 1.1rem;
  }
}
</style>