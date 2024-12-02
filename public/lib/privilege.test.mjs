/**
 * @jest-environment jsdom
 */

import fs from "fs";
import path from "path";
import "@testing-library/jest-dom";
import { updateComponentVisibility } from "../common/update-visible.mjs";
import { updateAnnouncementVisibility } from "../common/update-announcement-visible.mjs";

describe("LocalStorage and Component Visibility", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });

    const html = fs.readFileSync(
      path.resolve(__dirname, "../directory.html"),
      "utf8"
    );
    document.body.innerHTML = html;
  });

  it("should hide the component when user is 'citizen'", async () => {
    window.localStorage.getItem.mockReturnValue("citizen");
    updateComponentVisibility();
    const hiddenComponent = document.getElementById("test-administrator");
    expect(hiddenComponent).toHaveStyle("display: none");
  });

  it("should hide the component when user is 'coordinator'", async () => {
    window.localStorage.getItem.mockReturnValue("coordinator");
    updateComponentVisibility();
    const hiddenComponent = document.getElementById("test-administrator");
    expect(hiddenComponent).toHaveStyle("display: none");
  });

  it("should show the component when user is 'administrator'", () => {
    window.localStorage.getItem.mockReturnValue("administrator");
    updateComponentVisibility();
    const hiddenComponent = document.getElementById("test-administrator");
    expect(hiddenComponent).toHaveStyle("display: block");
  });
});

describe("LocalStorage and Announcement Visibility", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });

    const html = fs.readFileSync(
      path.resolve(__dirname, "../chat.html"),
      "utf8"
    );
    document.body.innerHTML = html;
  });

  it("should hide the component when user is 'citizen'", async () => {
    window.localStorage.getItem.mockReturnValue("citizen");
    updateAnnouncementVisibility();
    const hiddenComponent = document.getElementById("input-area");
    expect(hiddenComponent).toHaveStyle("display: none");
  });

  it("should show the component when user is 'coordinator'", async () => {
    window.localStorage.getItem.mockReturnValue("coordinator");
    updateAnnouncementVisibility();
    const hiddenComponent = document.getElementById("input-area");
    expect(hiddenComponent).toHaveStyle("display: block");
  });

  it("should show the component when user is 'administrator'", () => {
    window.localStorage.getItem.mockReturnValue("administrator");
    updateAnnouncementVisibility();
    const hiddenComponent = document.getElementById("input-area");
    expect(hiddenComponent).toHaveStyle("display: block");
  });
});
