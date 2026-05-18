<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  PhCaretLeft,
  PhCaretRight,
  PhPencilSimple,
  PhPlus,
  PhTrash,
} from "@phosphor-icons/vue";

import AppShell from "../components/layout/AppShell.vue";
import AppSidebar from "../components/layout/AppSidebar.vue";
import BookshelfFormModal from "../components/BookshelfFormModal.vue";
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
const showShelfModal = ref(false);

const shelfName = ref("");
const shelfDescription = ref("");
const selectedBookIds = ref<string[]>([]);
const editingShelfId = ref<string | null>(null);

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

function openShelfModal() {
  resetForm();
  showShelfModal.value = true;
}

function closeShelfModal() {
  resetForm();
  showShelfModal.value = false;
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
  showShelfModal.value = true;
}

function replaceShelf(updated: Bookshelf) {
  const index = shelves.value.findIndex((shelf) => shelf._id === updated._id);

  if (index >= 0) {
    shelves.value[index] = updated;
  }
}

function shelfRailId(shelf: Bookshelf) {
  return `shelf-rail-${shelf._id ?? shelf.name.replace(/\W+/g, "-")}`;
}

function scrollShelf(shelf: Bookshelf, direction: "left" | "right") {
  const rail = document.getElementById(shelfRailId(shelf));
  if (!rail) return;

  rail.scrollBy({
    left: direction === "left" ? -rail.clientWidth : rail.clientWidth,
    behavior: "smooth",
  });
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
    showShelfModal.value = false;
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

    <section class="bookshelf-page">
      <header class="page-header">
        <h1 class="page-title">Book Shelf</h1>

        <button class="add-shelf-btn" type="button" :disabled="!books.length" @click="openShelfModal">
          <PhPlus :size="18" weight="bold" />
          Add shelf
        </button>
      </header>

      <p v-if="error" class="error" role="alert">
        {{ error }}
      </p>

      <div v-if="loading" class="empty-state">Loading bookshelves...</div>

      <template v-else>
        <div v-if="!books.length" class="empty-state">
          Add books to your library before creating bookshelves.
        </div>

        <div v-if="shelves.length" class="shelf-stack">
          <section
            v-for="shelf in shelves"
            :key="shelf._id"
            class="shelf-section"
          >
            <div class="shelf-heading">
              <div>
                <div class="shelf-title-row">
                  <h2 class="shelf-title">{{ shelf.name }}</h2>
                  <button
                class="title-icon-btn"
                type="button"
                aria-label="Edit bookshelf"
                @click="startEditShelf(shelf)"
              >
                    <PhPencilSimple :size="17" />
                  </button>
                  <button
                    class="title-icon-btn title-icon-btn--danger"
                    type="button"
                aria-label="Delete bookshelf"
                @click="removeShelf(shelf)"
              >
                    <PhTrash :size="17" />
                  </button>
                </div>

                <p v-if="shelf.description" class="shelf-description">
                  {{ shelf.description }}
                </p>
              </div>

              <span class="shelf-count">
                {{ shelf.bookIds.length }} book{{ shelf.bookIds.length === 1 ? "" : "s" }}
              </span>
            </div>

            <div v-if="shelf.bookIds.length" class="shelf-rail-wrap">
              <button
                v-if="shelf.bookIds.length > 6"
                class="rail-arrow rail-arrow--left"
                type="button"
                aria-label="Scroll shelf left"
                @click="scrollShelf(shelf, 'left')"
              >
                <PhCaretLeft :size="28" />
              </button>

              <div :id="shelfRailId(shelf)" class="book-rail">
                <article v-for="book in shelf.bookIds" :key="book._id" class="shelf-book">
                  <img :src="book.coverImage" :alt="book.title" class="book-cover" />
                  <h3 class="book-title">{{ book.title }}</h3>
                  <p class="book-author">{{ book.author }}</p>
                </article>
              </div>

              <button
                v-if="shelf.bookIds.length > 6"
                class="rail-arrow rail-arrow--right"
                type="button"
                aria-label="Scroll shelf right"
                @click="scrollShelf(shelf, 'right')"
              >
                <PhCaretRight :size="28" />
              </button>
            </div>

            <div v-else class="empty-state empty-state--shelf">
              No books selected for this shelf.
            </div>
          </section>
        </div>

        <div v-else class="empty-state">
          No bookshelves yet.
        </div>
      </template>

      <BookshelfFormModal
        v-model:open="showShelfModal"
        :books="books"
        :mode="editingShelfId ? 'edit' : 'add'"
        :shelf-name="shelfName"
        :selected-book-ids="selectedBookIds"
        :loading="saving"
        :error="formError"
        @update:shelf-name="shelfName = $event"
        @toggle-book="toggleBook"
        @submit="saveShelf"
        @close="closeShelfModal"
      />
    </section>
  </AppShell>
</template>

<style scoped>
.bookshelf-page {
  width: 100%;
  min-width: 0;
  display: grid;
  gap: 34px;
  overflow-x: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.page-title {
  margin: 0;
  font-size: 32px;
  line-height: 1;
  letter-spacing: 0;
  color: var(--text);
  font-family: ui-serif, Georgia, Cambria, serif;
}

.add-shelf-btn {
  min-width: 112px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: var(--green);
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
}

.add-shelf-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.shelf-stack {
  display: grid;
  gap: 46px;
}

.shelf-section {
  min-width: 0;
  display: grid;
  gap: 24px;
  padding-bottom: 44px;
  border-bottom: 4px solid rgba(231, 222, 210, 0.55);
}

.shelf-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
}

.shelf-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.shelf-title {
  margin: 0;
  color: #17120d;
  font-size: 28px;
  line-height: 1.05;
  font-weight: 900;
}

.shelf-description {
  margin: 8px 0 0;
  max-width: 64ch;
  color: var(--text-soft);
  font-size: 1rem;
}

.shelf-count {
  color: var(--text-soft);
  font-size: 0.98rem;
  font-weight: 800;
  white-space: nowrap;
}

.title-icon-btn {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #c9b8b2;
  cursor: pointer;
}

.title-icon-btn:hover {
  background: #f2ede6;
  color: var(--text);
}

.title-icon-btn--danger:hover {
  color: #b42318;
}

.shelf-rail-wrap {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  min-width: 0;
}

.shelf-rail-wrap:has(.rail-arrow) {
  grid-template-columns: 34px minmax(0, 1fr) 34px;
  gap: 12px;
}

.book-rail {
  display: grid;
  min-width: 0;
  grid-auto-flow: column;
  grid-auto-columns: 150px;
  gap: 30px;
  padding: 2px 0 6px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}

.book-rail::-webkit-scrollbar {
  display: none;
}

.shelf-book {
  min-width: 0;
  scroll-snap-align: start;
}

.book-cover {
  width: 100%;
  height: 220px;
  display: block;
  object-fit: contain;
  background: #d8d4cf;
  border-radius: 2px;
  box-shadow: 0 12px 30px rgba(54, 39, 24, 0.08);
}

.book-title {
  margin: 18px 0 0;
  color: #17120d;
  font-size: 1.35rem;
  line-height: 1.1;
  font-weight: 900;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  margin: 8px 0 0;
  color: #433c35;
  font-size: 1.08rem;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rail-arrow {
  width: 34px;
  height: 52px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #17120d;
  cursor: pointer;
}

.rail-arrow:hover {
  background: rgba(255, 255, 255, 0.55);
}

.error {
  margin: 0;
  padding: 14px 16px;
  border-radius: 14px;
  background: #fef3f2;
  border: 1px solid #fecdca;
  color: #b42318;
  font-size: 0.95rem;
}

.empty-state {
  padding: 26px;
  border-radius: 16px;
  border: 1px dashed var(--border);
  background: rgba(255, 255, 255, 0.35);
  color: var(--text-soft);
  font-size: 1rem;
}

.empty-state--shelf {
  margin-left: 66px;
}

@media (max-width: 960px) {
  .book-rail {
    grid-auto-columns: 140px;
    gap: 22px;
  }

  .book-cover {
    height: 205px;
  }

  .shelf-heading {
    align-items: start;
  }
}

@media (max-width: 640px) {
  .bookshelf-page {
    gap: 26px;
  }

  .page-header,
  .shelf-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .add-shelf-btn {
    width: 100%;
  }

  .book-rail {
    grid-auto-columns: 138px;
  }

  .shelf-rail-wrap:has(.rail-arrow) {
    grid-template-columns: minmax(0, 1fr);
  }

  .rail-arrow {
    display: none;
  }

  .book-cover {
    height: 203px;
  }

  .book-title {
    font-size: 1.12rem;
  }

  .book-author {
    font-size: 0.98rem;
  }

  .empty-state--shelf {
    margin-left: 0;
  }
}
</style>
