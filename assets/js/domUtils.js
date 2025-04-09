import { inputField, placeholder } from "./constants.js";

export const toggle = (element) => element.classList.toggle("active");
export const show = (element) => element.classList.add("active");
export const hide = (element) => element.classList.remove("active");
export const updatePlaceholderVisibility = () => {
  const hasFraction = inputField.querySelector('.fraction');
  const hasContent = inputField.textContent.trim().length > 0;
  placeholder.style.display = (hasFraction || hasContent) ? 'none' : 'block';
};