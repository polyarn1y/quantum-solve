import { inputField, solveButton, keyboardButton, keyboardContainer, mathButton, mathContainer, mathKeys, placeholder } from "./constants.js";
import { solve } from "./index.js";

export function addEventListeners() {
  window.addEventListener("load", () => {
    loader.classList.add("hidden");
  });

  inputField.addEventListener('keypress', (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      solve(inputField.textContent.trim());    
    }
  });

  inputField.addEventListener('input', () => {
    if (inputField.textContent.trim().length > 0) {
      placeholder.style.display = 'none';
    } else {
      placeholder.style.display = 'block';
    }
    if (inputField.innerHTML.includes('<br>')) {
      inputField.innerHTML = inputField.innerHTML.replace(/<br>/gi, '');
    }
  })

  solveButton.addEventListener('click', () => {
    solve(inputField.textContent.trim());    
  })

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
  } )
}