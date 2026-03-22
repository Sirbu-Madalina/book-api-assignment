<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { Book } from "../services/books";
import { getBooks, updateBook, deleteBook } from "../services/books";
import { PhTrash, PhPencilSimple } from "@phosphor-icons/vue";
import BookFormModal from "../components/BookFormModal.vue";

const books = ref<Book[]>([]);
const loading = ref(false);
const error = ref("");

const showModal = ref(false);
const editingId = ref<string | undefined>(undefined);

function emptyForm(): Book {
  return {
    _id: "",
    title: "",
    author: "",
    image: "",
    genre: "",
    publishedYear: new Date().getFullYear(),
    price: 0,
    stockQuantity: 0,
    inStock: false,
    description: "",
  };
}

const form = ref<Book>(emptyForm());

async function loadBooks() {
  loading.value = true;
  error.value = "";

  try {
    books.value = await getBooks();
  } catch (err: any) {
    console.error("Load books error:", err);
    error.value = err?.message || "Failed to load inventory.";
  } finally {
    loading.value = false;
  }
}

async function handleUpdateQuantity(book: Book) {
  if (!book._id) return;

  try {
    const quantity = Number(book.stockQuantity) || 0;
    const status = quantity > 0;

    book.stockQuantity = quantity;
    book.inStock = status;

    const updated = await updateBook(book._id, {
      stockQuantity: quantity,
      inStock: status,
    });

    books.value = books.value.map((b) =>
      b._id === updated._id ? updated : b
    );
  } catch (err: any) {
    console.error("Quantity update error:", err);
    alert(err?.message || "Failed to update quantity.");
    await loadBooks();
  }
}

function openEditModal(book: Book) {
  editingId.value = book._id;
  form.value = {
    ...emptyForm(),
    ...book,
    stockQuantity: Number(book.stockQuantity) || 0,
    inStock: (Number(book.stockQuantity) || 0) > 0,
    description: book.description ?? "",
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = undefined;
  form.value = emptyForm();
}

async function handleSaveBook() {
  if (!editingId.value) return;

  loading.value = true;
  error.value = "";

  try {
    const quantity = Number(form.value.stockQuantity) || 0;
    const payload = {
      title: form.value.title,
      author: form.value.author,
      image: form.value.image,
      genre: form.value.genre,
      publishedYear: Number(form.value.publishedYear),
      price: Number(form.value.price),
      stockQuantity: quantity,
      inStock: quantity > 0,
      description: form.value.description ?? "",
    };

    const updated = await updateBook(editingId.value, payload);

    books.value = books.value.map((b) =>
      b._id === updated._id ? updated : b
    );

    closeModal();
  } catch (err: any) {
    console.error("Save error:", err);
    alert(err?.message || "Failed to save changes.");
  } finally {
    loading.value = false;
  }
}

async function handleRemoveBook(id?: string) {
  if (!id) return;

  const confirmed = window.confirm("Are you sure you want to delete this book?");
  if (!confirmed) return;

  try {
    await deleteBook(id);
    books.value = books.value.filter((b) => b._id !== id);
  } catch (err: any) {
    console.error("Delete error:", err);
    alert(err?.message || "Delete failed.");
  }
}

const totalStockValue = computed(() => {
  return books.value
    .reduce(
      (acc, b) => acc + Number(b.price || 0) * Number(b.stockQuantity || 0),
      0
    )
    .toFixed(2);
});

const outOfStockCount = computed(() => {
  return books.value.filter((b) => Number(b.stockQuantity || 0) <= 0).length;
});

onMounted(loadBooks);
</script>

<template>
  <div class="admin-view">
    <header class="admin-header">
      <div class="header-text">
        <h1>Admin Dashboard</h1>
        <p>Manage book quantities and pricing</p>
      </div>

      <div class="stats-container">
        <div class="stat-card">
          <span class="label">Inventory Value</span>
          <span class="value">${{ totalStockValue }}</span>
        </div>

        <div class="stat-card">
          <span class="label">Out of Stock</span>
          <span class="value warning">{{ outOfStockCount }}</span>
        </div>
      </div>
    </header>

    <div v-if="loading && !books.length" class="state-msg">
      Loading inventory...
    </div>

    <div v-else-if="error" class="state-msg error">
      {{ error }}
    </div>

    <div v-else class="table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Book Details</th>
            <th>Genre</th>
            <th>Price</th>
            <th>Availability (Pcs)</th>
            <th class="actions-head">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="book in books" :key="book._id" class="data-row">
            <td>
              <div class="book-cell">
                <img :src="book.image" class="thumb" alt="cover" />
                <div class="info">
                  <span class="title">{{ book.title }}</span>
                  <span class="author">{{ book.author }}</span>
                </div>
              </div>
            </td>

            <td>
              <span class="tag">{{ book.genre }}</span>
            </td>

            <td class="price-val">
              ${{ Number(book.price).toFixed(2) }}
            </td>

            <td>
              <div class="stock-input-wrapper">
                <input
                  v-model.number="book.stockQuantity"
                  type="number"
                  min="0"
                  class="qty-input"
                  @change="handleUpdateQuantity(book)"
                />
                <span
                  :class="[
                    'status-dot',
                    Number(book.stockQuantity) > 0 ? 'online' : 'offline'
                  ]"
                ></span>
              </div>
            </td>

            <td class="actions-cell">
              <button @click="openEditModal(book)" class="btn-action edit">
                <PhPencilSimple :size="18" />
              </button>

              <button @click="handleRemoveBook(book._id)" class="btn-action delete">
                <PhTrash :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BookFormModal
      v-model:open="showModal"
      v-model="form"
      mode="edit"
      :loading="loading"
      @submit="handleSaveBook"
      @close="showModal = false"
    />
  </div>
</template>

<style scoped>
.admin-view {
  font-family: "Inter", sans-serif;
  color: #1f2430;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-text h1 {
  margin: 0;
  font-size: 2rem;
  font-family: ui-serif, Georgia, serif;
}

.header-text p {
  color: #666;
  margin: 0.25rem 0 0;
}

.stats-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  min-width: 140px;
}

.stat-card .label {
  font-size: 0.75rem;
  color: #888;
  font-weight: 700;
  text-transform: uppercase;
}

.stat-card .value {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
}

.stat-card .value.warning {
  color: #b42318;
}

.table-wrapper {
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th {
  background: #fafaf9;
  padding: 1rem;
  font-size: 0.8rem;
  color: #888;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.admin-table td {
  padding: 1rem;
  vertical-align: middle;
}

.data-row {
  transition: 0.2s;
  border-bottom: 1px solid #f5f5f5;
}

.data-row:hover {
  background: rgba(229, 151, 26, 0.04);
}

.book-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.thumb {
  width: 40px;
  height: 56px;
  border-radius: 4px;
  object-fit: cover;
}

.info .title {
  display: block;
  font-weight: 700;
  font-size: 0.95rem;
}

.info .author {
  font-size: 0.85rem;
  color: #666;
}

.tag {
  background: #f3f4f6;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
}

.price-val {
  font-weight: 600;
  font-family: monospace;
}

.stock-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.qty-input {
  width: 80px;
  padding: 0.45rem 0.65rem;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  font-size: 0.95rem;
}

.qty-input:focus {
  outline: none;
  border-color: #e5971a;
  box-shadow: 0 0 0 3px rgba(229, 151, 26, 0.15);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.status-dot.online {
  background: #12b76a;
}

.status-dot.offline {
  background: #f04438;
}

.actions-head {
  text-align: right;
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
}

.btn-action {
  border: none;
  background: transparent;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  transition: 0.2s;
}

.btn-action:hover {
  background: #f3f4f6;
}

.btn-action.delete:hover {
  color: #b42318;
  background: #fef3f2;
}

.btn-action.edit:hover {
  color: #e5971a;
}

.state-msg {
  padding: 3rem;
  text-align: center;
  color: #888;
}

.state-msg.error {
  color: #b42318;
}
</style>