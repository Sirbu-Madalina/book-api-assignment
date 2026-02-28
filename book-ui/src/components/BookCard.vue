<script setup lang="ts">
import type { Book } from "../services/books";
import { PhPencilSimple, PhTrash } from "@phosphor-icons/vue";

const props = defineProps<{
  book: Book;
  coverFallback: string;
  canManage: boolean;
}>();

const emit = defineEmits<{
  (e: "delete", id?: string): void;
  (e: "edit", book: Book): void;
}>();

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement;
  img.src = props.coverFallback;
}
</script>

<template>
  <article class="bookCard">
    <div class="bookCard__coverWrap">
      <img
        class="bookCard__cover"
        :src="book.image || coverFallback"
        :alt="book.title || 'Book cover'"
        loading="lazy"
        @error="onImgError"
      />
    </div>

    <div class="bookCard__body">
      <h3 class="bookCard__title">{{ book.title }}</h3>
      <p class="bookCard__author">{{ book.author }}</p>

      <div class="bookCard__footer">
        <span v-if="book.genre" class="pill">{{ book.genre }}</span>

        <div class="bookCard__actions" v-if="canManage">
          <button
  class="iconBtn"
  type="button"
  title="Edit"
  aria-label="Edit"
  @click="emit('edit', book)"
>
  <PhPencilSimple :size="18" weight="regular" />
</button>

<button
  class="iconBtn iconBtn--danger"
  type="button"
  title="Delete"
  aria-label="Delete"
  @click="emit('delete', book._id)"
>
  <PhTrash :size="18" weight="regular" />
</button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.bookCard {
  border-radius: 18px;
  border: 1px solid rgba(31, 36, 48, 0.12);
  background: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  display: grid;
}

.bookCard__coverWrap {
  background: rgba(31, 36, 48, 0.03);
  padding: 12px 12px 0;
}

.bookCard__cover {
  width: 100%;
  display: block;
  border-radius: 14px;
  aspect-ratio: 3 / 4; /* like a real book cover */
  object-fit: cover;
  border: 1px solid rgba(31, 36, 48, 0.10);
}

.bookCard__body {
  padding: 12px 14px 14px;
  display: grid;
  gap: 6px;
}

.bookCard__title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.2;
}

.bookCard__author {
  margin: 0;
  font-size: 13px;
  color: rgba(31, 36, 48, 0.62);
}

.bookCard__footer {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.pill {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(31, 36, 48, 0.12);
  background: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  color: rgba(31, 36, 48, 0.82);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookCard__actions {
  display: flex;
  gap: 10px;
}

.iconBtn {
  height: 36px;
  width: 36px;
  border-radius: 999px;
  border: 1px solid rgba(31, 36, 48, 0.12);
  background: rgba(255, 255, 255, 0.65);
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;
}

.iconBtn:hover {
  background: rgba(31, 36, 48, 0.04);
  border-color: rgba(229, 151, 26, 0.5);
}

.iconBtn--danger {
  border-color: rgba(180, 35, 24, 0.25);
  color: #b42318;
}
.iconBtn--danger:hover {
  background: rgba(180, 35, 24, 0.08);
}
</style>