import { inputField, placeholder } from "./constants.js";

export const toggle = (element) => element.classList.toggle("active");
export const show = (element) => element.classList.add("active");
export const hide = (element) => element.classList.remove("active");
export const updatePlaceholderVisibility = () => {
  const elements = ["fraction", "power"]
  const hasMath = elements.some(cls => inputField.querySelector(`.${cls}`))
  const hasContent = inputField.textContent.trim().length > 0;
  placeholder.style.display = (hasMath || hasContent) ? 'none' : 'block';
};