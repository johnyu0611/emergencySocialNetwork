/**
 * @jest-environment jest-environment-jsdom
 */
import { describe, expect, test } from "@jest/globals";
import { searchMessage } from "../common/load-messages.mjs";
import { searchUsers } from "../common/load-users.mjs";
import { searchStatus } from "../common/load-status.mjs";

describe("search message", () => {
  let resultsContainer, loadMoreButton;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="searchResults"></div>
      <button id="loadMoreButton" style="display: none;"></button>
    `;
    resultsContainer = document.getElementById("searchResults");
    loadMoreButton = document.getElementById("loadMoreButton");

    jest.clearAllMocks();
  });

  test("should display messages", () => {
    const results = [
      { sender: "Alice", timestamp: Date.now(), content: "Hi", status: "OK" },
      { sender: "Bob", timestamp: Date.now(), content: "Hi", status: "Help" }
    ];
    const currentPage = 0;
    const pageSize = 10;

    const page = searchMessage(
      results,
      resultsContainer,
      loadMoreButton,
      currentPage,
      pageSize
    );
    expect(page).toBe(1);
    expect(resultsContainer.children.length).toBe(2);

    const resultItem = resultsContainer.querySelector(".result-item");
    expect(resultItem.textContent).toContain("Alice");
    expect(resultItem.textContent).toContain("Hi");
  });

  test("should display messages, with correct status shown", () => {
    const results = [
      { sender: "Alice", timestamp: Date.now(), content: "Hi", status: "OK" }
    ];
    const currentPage = 0;
    const pageSize = 10;
    searchMessage(
      results,
      resultsContainer,
      loadMoreButton,
      currentPage,
      pageSize
    );
    const resultItems = resultsContainer.querySelector(".result-item");
    const iconAlice = resultItems.querySelector("i");
    expect(iconAlice.classList.contains("fa-circle-check")).toBe(true);
  });

  test("should display messages, with undefined status not found", () => {
    const results = [
      {
        sender: "Alice",
        timestamp: Date.now(),
        content: "Hi",
        status: "undefined"
      }
    ];
    const currentPage = 0;
    const pageSize = 10;
    searchMessage(
      results,
      resultsContainer,
      loadMoreButton,
      currentPage,
      pageSize
    );
    const resultItems = resultsContainer.querySelector(".result-item");
    const iconAlice = resultItems.querySelector("i");
    expect(iconAlice).toBe(null);
  });

  test("should not display messages", () => {
    const results = [];
    const currentPage = 0;
    const pageSize = 10;

    const page = searchMessage(
      results,
      resultsContainer,
      loadMoreButton,
      currentPage,
      pageSize
    );
    expect(page).toBe(0);
    expect(resultsContainer.children.length).toBe(0);

    expect(resultsContainer.textContent).toContain("No results found.");
  });

  test("should display 10 messages and load button", () => {
    const results = [
      {
        sender: "Alice",
        timestamp: Date.now(),
        content: "Hello!",
        status: "OK"
      },
      { sender: "Alice", timestamp: Date.now(), content: "Hi", status: "OK" },
      {
        sender: "Bob",
        timestamp: Date.now() - 60000,
        content: "Hello!",
        status: "Help"
      },
      {
        sender: "Charlie",
        timestamp: Date.now() - 120000,
        content: "Good morning",
        status: "Emergency"
      },
      {
        sender: "Dave",
        timestamp: Date.now() - 180000,
        content: "How are you?",
        status: "OK"
      },
      {
        sender: "Eve",
        timestamp: Date.now() - 240000,
        content: "Need assistance",
        status: "Help"
      },
      {
        sender: "Frank",
        timestamp: Date.now() - 300000,
        content: "Check this out",
        status: "OK"
      },
      {
        sender: "Grace",
        timestamp: Date.now() - 360000,
        content: "All clear here",
        status: "OK"
      },
      {
        sender: "Heidi",
        timestamp: Date.now() - 420000,
        content: "Help required",
        status: "Help"
      },
      {
        sender: "Ivan",
        timestamp: Date.now() - 480000,
        content: "Urgent issue!",
        status: "Emergency"
      },
      {
        sender: "Judy",
        timestamp: Date.now() - 540000,
        content: "Thanks for the update",
        status: "OK"
      }
    ];

    const currentPage = 0;
    const pageSize = 10;

    const page = searchMessage(
      results,
      resultsContainer,
      loadMoreButton,
      currentPage,
      pageSize
    );
    expect(page).toBe(1);
    expect(resultsContainer.children.length).toBe(10);

    const resultItem = resultsContainer.querySelector(".result-item");
    expect(resultItem.textContent).toContain("Alice");
    expect(resultItem.textContent).toContain("Hello!");

    expect(loadMoreButton.style.display).toBe("inline-block");
  });
});

describe("search username", () => {
  let resultsContainer;

  beforeEach(() => {
    document.body.innerHTML = `
        <div id="searchResults"></div>
      `;
    resultsContainer = document.getElementById("searchResults");

    jest.clearAllMocks();
  });

  test("should display users, full name", () => {
    const sortedResults = [
      { username: "Alice", isOnline: true, status: "OK" },
      { username: "Bob", isOnline: false, status: "Help" },
      { username: "Charlie", isOnline: true, status: "Emergency" }
    ];

    searchUsers(sortedResults, resultsContainer);

    const resultItem = resultsContainer.querySelector(".result-item");
    expect(resultItem.textContent).toContain("Alice");
    expect(resultItem.textContent).toContain("OK");
  });

  test("should display users, part of the full name", () => {
    const sortedResults = [
      { username: "Alice", isOnline: true, status: "OK" },
      { username: "Bob", isOnline: false, status: "Help" },
      { username: "Charlie", isOnline: true, status: "Emergency" }
    ];

    searchUsers(sortedResults, resultsContainer);

    const resultItem = resultsContainer.querySelector(".result-item");
    expect(resultItem.textContent).toContain("Ali");
    expect(resultItem.textContent).toContain("OK");
  });

  test("should not display users", () => {
    const results = [];
    searchUsers(results, resultsContainer);
    expect(resultsContainer.textContent).toContain("No results found.");
  });
});

describe("search status", () => {
  let resultsContainer;

  beforeEach(() => {
    document.body.innerHTML = `
        <div id="searchResults"></div>
      `;
    resultsContainer = document.getElementById("searchResults");

    jest.clearAllMocks();
  });

  test("should display users", () => {
    const sortedResults = [
      { username: "Alice", isOnline: true, status: "OK" },
      { username: "Bob", isOnline: false, status: "Help" },
      { username: "Charlie", isOnline: true, status: "Emergency" }
    ];

    searchStatus(sortedResults, resultsContainer);

    const resultItem = resultsContainer.querySelector(".result-item");
    expect(resultItem.textContent).toContain("Alice");
    expect(resultItem.textContent).toContain("OK");
  });

  test("should not display users", () => {
    const results = [];
    searchStatus(results, resultsContainer);
    expect(resultsContainer.textContent).toContain("No citizens found.");
  });
});
