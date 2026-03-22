import { ref, watch } from "vue";
import type { Book } from "../services/books";

const savedBooks = ref<Book[]>(loadSavedFromStorage());

function loadSavedFromStorage(): Book[] {
  const raw = localStorage.getItem("savedBooks");
  return raw ? JSON.parse(raw) : [];
}

watch(
  savedBooks,
  (value) => {
    localStorage.setItem("savedBooks", JSON.stringify(value));
  },
  { deep: true }
);

export function useSavedBooks() {
  function toggleSave(book: Book) {
    const index = savedBooks.value.findIndex((b) => b._id === book._id);

    if (index >= 0) {
      savedBooks.value.splice(index, 1);
    } else {
      savedBooks.value.push(book);
    }
  }

  function removeSaved(id?: string) {
    if (!id) return;
    savedBooks.value = savedBooks.value.filter((b) => b._id !== id);
  }

  function isSaved(id?: string) {
    return savedBooks.value.some((b) => b._id === id);
  }

  const savedCount = () => savedBooks.value.length;

  return {
    savedBooks,
    toggleSave,
    removeSaved,
    isSaved,
    savedCount,
  };
}