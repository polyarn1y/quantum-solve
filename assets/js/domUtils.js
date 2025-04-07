import { inputField, placeholder } from "./constants.js";

export function show(elem) {
  elem.classList.add("active");
}

export function hide(elem) {
  elem.classList.remove("active");
}

export function updatePlaceholderVisibility() {
  if (inputField.textContent.trim().length > 0) {
    placeholder.style.display = 'none';
  } else {
    placeholder.style.display = 'block';
  }
}