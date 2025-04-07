import { 
  inputField, 
  solveButton, 
  keyboardButton, 
  keyboardContainer, 
  mathButton, 
  mathContainer, 
  mathKeys, 
  placeholder 
} from "./constants.js";
import { solve } from "./index.js";
import { toggle, updatePlaceholderVisibility } from "./domUtils.js";
import { insertFraction } from "./math.js";

export function addGlobalEventListeners() {
  window.addEventListener("load", () => { loader.remove(); });

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
    toggle(mathButton);
    toggle(mathContainer);
    if (keyboardButton.classList.contains("active")) {
      toggle(keyboardButton);
      toggle(keyboardContainer);
    }
  });

  keyboardButton.addEventListener('click', () => {
    toggle(keyboardButton);
    toggle(keyboardContainer);
    
    if (mathButton.classList.contains("active")) {
      toggle(mathButton);
      toggle(mathContainer);
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