import { inputField } from "../constants.js";
import { getSelection, isAtEnd, isAtStart, moveFocus } from "./inputFieldBackspaceHandler.js";
import { updatePlaceholderVisibility } from "../utils.js";

const SQRT_TEMPLATE = `
  <span class="sqrt" contenteditable="false">
    <span class="sqrt-symbol" contenteditable="false">
      <img src="assets/images/math/root.svg" alt="">
    </span>
    <span class="sqrt-content" contenteditable="true"></span>
  </span>
`.trim();

const createSqrtElement = (contentText) => {
  const template = document.createElement('span');
  template.innerHTML = SQRT_TEMPLATE;
  const sqrtElement = template.firstChild;
  const content = sqrtElement.querySelector(".sqrt-content");

  if (contentText) content.textContent = contentText;

  setupSqrtEvents(content);
  return sqrtElement;
};

export const insertSqrt = (contentText) => {
  const sqrtElement = createSqrtElement(contentText);
  const content = sqrtElement.querySelector(".sqrt-content");
  const selection = window.getSelection();
  if (selection.rangeCount && inputField.contains(selection.getRangeAt(0).startContainer)) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(sqrtElement);
    const newRange = document.createRange();
    newRange.setStartAfter(sqrtElement);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  } else {
    inputField.appendChild(sqrtElement);
    const range = document.createRange();
    range.setStartAfter(sqrtElement);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  content.focus();
  updatePlaceholderVisibility();
};

const setupSqrtEvents = (content) => {
  const sqrt = content.closest('.sqrt');

  const handleBackspace = (element, e) => {
    if (e.key === 'Backspace' && element.textContent.trim() === '') {
      e.preventDefault();
      if (sqrt.dataset.selected === 'true') {
        const parent = sqrt.parentNode;
        const nextSibling = sqrt.nextSibling;
        sqrt.remove();
        const selection = window.getSelection();
        const range = document.createRange();
        if (nextSibling) {
          range.setStartBefore(nextSibling);
        } else if (parent) {
          range.setStart(parent, parent.childNodes.length);
        } else {
          range.setStart(inputField, 0);
        }
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        const allSqrt = inputField.querySelectorAll('.sqrt');
        allSqrt.forEach(s => {
          s.classList.remove('selected');
          s.dataset.selected = 'false';
        });
        sqrt.classList.add('selected');
        sqrt.dataset.selected = 'true';
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(sqrt);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const removeSelection = () => {
    sqrt.classList.remove('selected');
    sqrt.dataset.selected = 'false';
  };

  content.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      handleBackspace(content, e);
    } else if (e.key !== 'Backspace') {
      removeSelection();
    }
  });

  document.addEventListener('click', (e) => {
    if (!sqrt.contains(e.target)) {
      removeSelection();
    }
  });
};