import { inputField, solveButton, keyboardButton, keyboardContainer, mathButton, mathContainer, mathKeys, placeholder } from "./constants.js";
import { solve } from "./index.js";
import { show, hide, updatePlaceholderVisibility } from "./domUtils.js";
import { insertFraction } from "./math.js";

export function addGlobalEventListeners() {
  window.addEventListener("load", () => {
    loader.remove();
  });

  inputField.addEventListener('keypress', (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      solve(inputField.textContent.trim());    
    }
  });

  inputField.addEventListener('input', () => {
    updatePlaceholderVisibility();
  inputField.querySelectorAll('br').forEach(br => br.remove());
  });

  solveButton.addEventListener('click', () => {
    solve(inputField.textContent.trim());    
  });

  mathButton.addEventListener('click', () => {
    mathButton.classList.toggle("active");
    mathContainer.classList.toggle("active");
    
    if (keyboardButton.classList.contains("active")) {
      keyboardButton.classList.remove("active");
      keyboardContainer.classList.remove("active");
    }
  });

  keyboardButton.addEventListener('click', () => {
    keyboardContainer.classList.toggle("active");
    keyboardButton.classList.toggle("active");
    
    if (mathButton.classList.contains("active")) {
      mathButton.classList.remove("active");
      mathContainer.classList.remove("active");
    }
  });

  mathKeys.forEach((key) => {
    if (key.dataset.action === "fraction") {
      key.addEventListener('click', () => {
        insertFraction();
        updatePlaceholderVisibility();
      })
    }
  });
}