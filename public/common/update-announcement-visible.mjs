import { PRIVILEGE_LEVEL } from "./constants.mjs";

export function updateAnnouncementVisibility() {
  const user = localStorage.getItem(PRIVILEGE_LEVEL);
  const hiddenComponent = document.getElementById("input-area");
  if (user === "citizen") {
    hiddenComponent.style.display = "none";
  } else {
    hiddenComponent.style.display = "block";
  }
}
