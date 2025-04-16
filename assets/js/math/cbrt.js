import { inputField } from "../constants.js";
import { getSelection, isAtEnd, isAtStart, moveFocus } from "./inputFieldBackspaceHandler.js";
import { updatePlaceholderVisibility } from "../utils.js";

const CBRT_TEMPLATE = `
  <span class="cbrt" contenteditable="false">
    <span class="cbrt-index" contenteditable="false">3</span>
    <span class="cbrt-symbol" contenteditable="false">
      <img src="assets/images/math/root.svg" alt="">
    </span>
    <span class="cbrt-content" contenteditable="true"></span>
  </span>
`.trim();

const createCbrtElement = (contentText) => {
  const template = document.createElement('span');
  template.innerHTML = CBRT_TEMPLATE;
  const cbrtElement = template.firstChild;
  const content = cbrtElement.querySelector(".cbrt-content");

  if (contentText) content.textContent = contentText;

  setupCbrtEvents(content);
  return cbrtElement;
};

export const insertCbrt = (contentText) => {
  const cbrtElement = createCbrtElement(contentText);
  const content = cbrtElement.querySelector(".cbrt-content");
  const selection = window.getSelection();
  if (selection.rangeCount && inputField.contains(selection.getRangeAt(0).startContainer)) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(cbrtElement);
    const newRange = document.createRange();
    newRange.setStartAfter(cbrtElement);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  } else {
    inputField.appendChild(cbrtElement);
    const range = document.createRange();
    range.setStartAfter(cbrtElement);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  content.focus();
  updatePlaceholderVisibility();
};

const setupCbrtEvents = (content) => {
  const cbrt = content.closest('.cbrt');

  const handleBackspace = (element, e) => {
    if (e.key === 'Backspace' && element.textContent.trim() === '') {
      e.preventDefault();
      if (cbrt.dataset.selected === 'true') {
        const parent = cbrt.parentNode;
        const nextSibling = cbrt.nextSibling;
        cbrt.remove();
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
        const allCbrt = inputField.querySelectorAll('.cbrt');
        allCbrt.forEach(s => {
          s.classList.remove('selected');
          s.dataset.selected = 'false';
        });
        cbrt.classList.add('selected');
        cbrt.dataset.selected = 'true';
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(cbrt);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const removeSelection = () => {
    cbrt.classList.remove('selected');
    cbrt.dataset.selected = 'false';
  };

  content.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      handleBackspace(content, e);
    } else if (e.key !== 'Backspace') {
      removeSelection();
    }
  });

  document.addEventListener('click', (e) => {
    if (!cbrt.contains(e.target)) {
      removeSelection();
    }
  });
};