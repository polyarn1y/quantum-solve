import { inputField, solveButton, keyboardButton, keyboardContainer } from "./constants.js";
import { solve } from "./index.js";

export function addEventListeners() {
  window.addEventListener("load", () => {
    loader.classList.add("hidden");
  });
  
  inputField.addEventListener('keypress', (event) => {
    if (event.key === "Enter") {
      solve(inputField.value.trim());
    }
  });
  
  solveButton.addEventListener('click', () => {
    solve(inputField.value.trim());
  })

  keyboardButton.addEventListener('click', () => {
    keyboardContainer.classList.toggle("active");
  });
}