import { PRIVILEGE_LEVEL } from "./constants.mjs";

export function updateComponentVisibility() {
  const user = localStorage.getItem(PRIVILEGE_LEVEL);
  const hiddenComponent = document.getElementById("test-administrator");
  if (user !== "administrator") {
    hiddenComponent.style.display = "none";
  } else {
    hiddenComponent.style.display = "block";
  }
}
