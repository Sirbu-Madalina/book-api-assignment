import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BookCard from "../../components/BookCard.vue";
import type { Book } from "../../services/books";

const baseBook: Book = {
  _id: "1",
  title: "Atomic Habits",
  author: "James Clear",
  coverImage: "https://example.com/book.jpg",
  description: "",
  totalPages: 320,
  currentPage: 50,
  status: "currently-reading",
  targetDate: "2026-04-20",
  isFavorite: false,
  userId: "user1",
  createdAt: "",
  updatedAt: "",
};

describe("BookCard", () => {
  it("renders book title and author", () => {
    const wrapper = mount(BookCard, {
      props: {
        book: baseBook,
      },
    });

    expect(wrapper.text()).toContain("Atomic Habits");
    expect(wrapper.text()).toContain("James Clear");
  });

  it("shows the correct status label", () => {
    const wrapper = mount(BookCard, {
      props: {
        book: baseBook,
      },
    });

    expect(wrapper.text()).toContain("Currently reading");
  });

  it("shows deadline when targetDate exists and status is not finished", () => {
    const wrapper = mount(BookCard, {
      props: {
        book: baseBook,
      },
    });

    expect(wrapper.text()).toContain("Deadline:");
  });

  it("does not show deadline when status is finished", () => {
    const finishedBook: Book = {
      ...baseBook,
      status: "finished",
    };

    const wrapper = mount(BookCard, {
      props: {
        book: finishedBook,
      },
    });

    expect(wrapper.text()).not.toContain("Deadline:");
  });

  it("disables add time button when status is not currently-reading", () => {
    const wantToReadBook: Book = {
      ...baseBook,
      status: "want-to-read",
    };

    const wrapper = mount(BookCard, {
      props: {
        book: wantToReadBook,
      },
    });

    const addTimeButton = wrapper.get(".add-time-btn");
    expect(addTimeButton.attributes("disabled")).toBeDefined();
  });

  it("emits edit-book when edit button is clicked", async () => {
    const wrapper = mount(BookCard, {
      props: {
        book: baseBook,
      },
    });

    const editButton = wrapper.get('button[aria-label="Edit book"]');
    await editButton.trigger("click");

    expect(wrapper.emitted("edit-book")).toBeTruthy();
  });
});