import { inputField, solveButton, keyboardButton, keyboardContainer, mathButton, mathContainer } from "./constants.js";
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

  mathButton.addEventListener('click', () => {
    mathButton.classList.toggle("active");
    mathContainer.classList.toggle("active");
  });
  

  keyboardButton.addEventListener('click', () => {
    keyboardContainer.classList.toggle("active");
    keyboardButton.classList.toggle("active");
  });
}