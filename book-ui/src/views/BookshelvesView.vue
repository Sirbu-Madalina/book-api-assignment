<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  PhBookmarkSimple,
  PhPencilSimple,
  PhPlus,
  PhTrash,
  PhX,
} from "@phosphor-icons/vue";

import AppShell from "../components/layout/AppShell.vue";
import AppSidebar from "../components/layout/AppSidebar.vue";
import { getBooks, type Book } from "../services/books";
import {
  createBookshelf,
  deleteBookshelf,
  getBookshelves,
  updateBookshelf,
  type Bookshelf,
} from "../services/bookshelves";

const books = ref<Book[]>([]);
const shelves = ref<Bookshelf[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const formError = ref("");

const shelfName = ref("");
const shelfDescription = ref("");
const selectedBookIds = ref<string[]>([]);
const editingShelfId = ref<string | null>(null);

const totalBooksShelved = computed(() => {
  const ids = new Set<string>();
  shelves.value.forEach((shelf) => {
    shelf.bookIds.forEach((book) => {
      if (book._id) ids.add(book._id);
    });
  });
  return ids.size;
});

async function loadBookshelvesPage() {
  loading.value = true;
  error.value = "";

  try {
    const [booksResult, shelvesResult] = await Promise.all([
      getBooks(),
      getBookshelves(),
    ]);

    books.value = booksResult;
    shelves.value = shelvesResult;
  } catch (e: any) {
    error.value = e?.message || "Failed to load bookshelves.";
  } finally {
    loading.value = false;
  }
}

function toggleBook(bookId?: string) {
  if (!bookId) return;

  if (selectedBookIds.value.includes(bookId)) {
    selectedBookIds.value = selectedBookIds.value.filter((id) => id !== bookId);
    return;
  }

  selectedBookIds.value = [...selectedBookIds.value, bookId];
}

function resetForm() {
  shelfName.value = "";
  shelfDescription.value = "";
  selectedBookIds.value = [];
  editingShelfId.value = null;
  formError.value = "";
}

function startEditShelf(shelf: Bookshelf) {
  if (!shelf._id) return;

  editingShelfId.value = shelf._id;
  shelfName.value = shelf.name;
  shelfDescription.value = shelf.description ?? "";
  selectedBookIds.value = shelf.bookIds
    .map((book) => book._id)
    .filter((id): id is string => !!id);
  formError.value = "";
}

function replaceShelf(updated: Bookshelf) {
  const index = shelves.value.findIndex((shelf) => shelf._id === updated._id);

  if (index >= 0) {
    shelves.value[index] = updated;
  }
}

async function saveShelf() {
  formError.value = "";
  error.value = "";

  if (!shelfName.value.trim()) {
    formError.value = "Give your bookshelf a name.";
    return;
  }

  saving.value = true;

  try {
    const payload = {
      name: shelfName.value.trim(),
      description: shelfDescription.value.trim(),
      bookIds: selectedBookIds.value,
    };

    if (editingShelfId.value) {
      const updated = await updateBookshelf(editingShelfId.value, payload);
      replaceShelf(updated);
    } else {
      const created = await createBookshelf(payload);
      shelves.value.unshift(created);
    }

    resetForm();
  } catch (e: any) {
    formError.value = e?.message || "Could not save bookshelf.";
  } finally {
    saving.value = false;
  }
}

async function removeShelf(shelf: Bookshelf) {
  if (!shelf._id) return;

  try {
    await deleteBookshelf(shelf._id);
    shelves.value = shelves.value.filter((item) => item._id !== shelf._id);

    if (editingShelfId.value === shelf._id) {
      resetForm();
    }
  } catch (e: any) {
    error.value = e?.message || "Could not delete bookshelf.";
  }
}

onMounted(loadBookshelvesPage);
</script>

<template>
  <AppShell>
    <template #sidebar>
      <AppSidebar />
    </template>

    <section class="bookshelves-page">
      <header class="hero">
        <div>
          <h1 class="hero__title">Bookshelves</h1>
          <p class="hero__subtitle">
            Create custom categories and choose which books belong there.
          </p>
        </div>
      </header>

      <p v-if="error" class="error" role="alert">
        {{ error }}
      </p>

      <div v-if="loading" class="empty-state">Loading bookshelves...</div>

      <template v-else>
        <section class="stats-grid">
          <article class="stat-card">
            <PhBookmarkSimple :size="22" class="stat-card__icon" />
            <span class="stat-card__label">Bookshelves</span>
            <strong class="stat-card__value">{{ shelves.length }}</strong>
          </article>

          <article class="stat-card">
            <PhBookmarkSimple :size="22" class="stat-card__icon stat-card__icon--green" />
            <span class="stat-card__label">Books shelved</span>
            <strong class="stat-card__value">{{ totalBooksShelved }}</strong>
          </article>
        </section>

        <section class="editor-panel">
          <div class="section-head">
            <h2 class="section-title">
              {{ editingShelfId ? "Edit Bookshelf" : "Add Bookshelf" }}
            </h2>

            <button
              v-if="editingShelfId"
              class="icon-btn"
              type="button"
              aria-label="Cancel editing"
              @click="resetForm"
            >
              <PhX :size="17" />
            </button>
          </div>

          <div class="shelf-form">
            <label class="field">
              <span class="field__label">Category name</span>
              <input v-model="shelfName" type="text" placeholder="Summer reads" />
            </label>

            <label class="field">
              <span class="field__label">Description</span>
              <input
                v-model="shelfDescription"
                type="text"
                placeholder="Optional description"
              />
            </label>
          </div>

          <div class="book-picker">
            <div class="book-picker__head">
              <span class="field__label">Select books</span>
              <span class="book-picker__count">
                {{ selectedBookIds.length }} selected
              </span>
            </div>

            <div v-if="books.length" class="book-options">
              <button
                v-for="book in books"
                :key="book._id"
                class="book-option"
                :class="{ active: selectedBookIds.includes(book._id || '') }"
                type="button"
                @click="toggleBook(book._id)"
              >
                <span class="checkbox">
                  <span v-if="selectedBookIds.includes(book._id || '')" />
                </span>
                <span class="book-option__text">
                  <strong>{{ book.title }}</strong>
                  <small>{{ book.author }}</small>
                </span>
              </button>
            </div>

            <div v-else class="empty-state">
              Add books to your library before creating bookshelves.
            </div>
          </div>

          <p v-if="formError" class="error error--compact" role="alert">
            {{ formError }}
          </p>

          <button
            class="save-btn"
            type="button"
            :disabled="saving || !books.length"
            @click="saveShelf"
          >
            <PhPlus v-if="!editingShelfId" :size="18" />
            {{ saving ? "Saving..." : editingShelfId ? "Save changes" : "Create shelf" }}
          </button>
        </section>

        <section class="shelves-section">
          <div class="section-head">
            <h2 class="section-title">Your Bookshelves</h2>
          </div>

          <div v-if="shelves.length" class="shelf-grid">
            <article v-for="shelf in shelves" :key="shelf._id" class="shelf-card">
              <div class="shelf-card__head">
                <div>
                  <h3 class="shelf-card__title">{{ shelf.name }}</h3>
                  <p class="shelf-card__meta">
                    {{ shelf.bookIds.length }} book{{ shelf.bookIds.length === 1 ? "" : "s" }}
                  </p>
                </div>

                <div class="row-actions">
                  <button
                    class="icon-btn"
                    type="button"
                    aria-label="Edit bookshelf"
                    @click="startEditShelf(shelf)"
                  >
                    <PhPencilSimple :size="17" />
                  </button>
                  <button
                    class="icon-btn icon-btn--danger"
                    type="button"
                    aria-label="Delete bookshelf"
                    @click="removeShelf(shelf)"
                  >
                    <PhTrash :size="17" />
                  </button>
                </div>
              </div>

              <p v-if="shelf.description" class="shelf-card__description">
                {{ shelf.description }}
              </p>

              <div v-if="shelf.bookIds.length" class="shelf-books">
                <div v-for="book in shelf.bookIds" :key="book._id" class="shelf-book">
                  <img :src="book.coverImage" :alt="book.title" />
                  <div>
                    <strong>{{ book.title }}</strong>
                    <small>{{ book.author }}</small>
                  </div>
                </div>
              </div>

              <div v-else class="empty-state empty-state--small">
                No books selected.
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            No bookshelves yet.
          </div>
        </section>
      </template>
    </section>
  </AppShell>
</template>

<style scoped>
.bookshelves-page {
  display: grid;
  gap: 24px;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.hero__title {
  font-size: clamp(2.4rem, 4vw, 3.8rem);
  line-height: 1.02;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.stat-card,
.editor-panel,
.shelf-card {
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
  color: var(--accent);
}

.stat-card__icon--green {
  color: var(--green);
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

.editor-panel {
  display: grid;
  gap: 16px;
  padding: 22px;
}

.section-head,
.shelf-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-title,
.shelf-card__title {
  margin: 0;
  color: var(--text);
  font-family: ui-serif, Georgia, Cambria, serif;
}

.section-title {
  font-size: 1.8rem;
  line-height: 1.1;
}

.shelf-card__title {
  font-size: 1.35rem;
}

.shelf-form {
  display: grid;
  grid-template-columns: minmax(220px, 0.8fr) 1fr;
  gap: 12px;
}

.field {
  display: grid;
  gap: 8px;
}

.field__label {
  color: var(--text-soft);
  font-size: 0.9rem;
  font-weight: 800;
}

input {
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

input:focus {
  border-color: rgba(126, 151, 118, 0.7);
  box-shadow: 0 0 0 4px rgba(126, 151, 118, 0.12);
}

.book-picker {
  display: grid;
  gap: 10px;
}

.book-picker__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.book-picker__count,
.shelf-card__meta,
.shelf-card__description {
  color: var(--text-soft);
  font-size: 0.92rem;
}

.book-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  max-height: 280px;
  overflow: auto;
  padding-right: 4px;
}

.book-option {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: white;
  color: var(--text);
  cursor: pointer;
  text-align: left;
}

.book-option.active {
  border-color: rgba(126, 151, 118, 0.7);
  background: var(--green-soft);
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: white;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}

.checkbox span {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: var(--green);
}

.book-option__text,
.shelf-book div {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.book-option__text strong,
.shelf-book strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-option__text small,
.shelf-book small {
  color: var(--text-soft);
}

.save-btn {
  width: fit-content;
  min-width: 142px;
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

.save-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.shelves-section {
  display: grid;
  gap: 14px;
}

.shelf-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.shelf-card {
  display: grid;
  gap: 14px;
  padding: 20px;
}

.shelf-card__meta {
  margin: 5px 0 0;
}

.shelf-card__description {
  margin: 0;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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
  color: var(--text);
}

.icon-btn--danger:hover {
  color: #b42318;
}

.shelf-books {
  display: grid;
  gap: 10px;
}

.shelf-book {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.shelf-book img {
  width: 42px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  background: #efe9e1;
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

.empty-state--small {
  padding: 14px;
}

@media (max-width: 1000px) {
  .stats-grid,
  .shelf-form,
  .book-options,
  .shelf-grid {
    grid-template-columns: 1fr;
  }
}
</style>
