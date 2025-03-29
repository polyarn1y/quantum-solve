import { inputField, solveButton } from "./constants.js";

export function addEventListeners() {
  window.addEventListener("load", () => {
    loader.classList.add("hidden");
  });
  
  inputField.addEventListener('keypress', (event) => {
    if (event.key === "Enter") {
      solve(inputField.value);
    }
  });
  
  solveButton.addEventListener('click', () => {
    solve(inputField.value);
  })
}