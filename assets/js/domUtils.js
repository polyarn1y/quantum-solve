import { inputField, placeholder } from "./constants.js";

export function toggle(element) {
  element.classList.toggle("active");
}

export function show(elem) {
  elem.classList.add("active");
}

export function hide(elem) {
  elem.classList.remove("active");
}

export function updatePlaceholderVisibility() {
  if (inputField.querySelector('.fraction')) {
    placeholder.style.display = 'none';
    return;
  }
  if (inputField.textContent.trim().length > 0) {
    placeholder.style.display = 'none';
  } else {
    placeholder.style.display = 'block';
  }
}