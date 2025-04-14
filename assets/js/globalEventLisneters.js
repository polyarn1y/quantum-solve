import { 
  inputField,
  solveButton,
  keyboardButton,
  keyboardContainer,
  mathButton,
  mathContainer,
  mathKeys,
} from "./constants.js";
import { solve } from "./index.js";
import { toggle, updatePlaceholderVisibility } from "./domUtils.js";
import { insertFraction } from "./math/fraction.js";
import { insertPower } from "./math/power.js";
import { removeLoader } from './loader.js';

const handleSolve = (expression) => solve(expression.trim());
const toggleWithExclusive = (button, container, otherButton, otherContainer) => {
  toggle(button);
  toggle(container);
  if (otherButton.classList.contains("active")) {
    toggle(otherButton);
    toggle(otherContainer);
  }
};

export const addGlobalEventListeners = () => {
  window.addEventListener("load", removeLoader);
  inputField.addEventListener('keypress', (event) => {
      if (event.key === "Enter") {
          event.preventDefault();
          handleSolve(inputField.textContent);
      }
      if (event.key === '/') {
        event.preventDefault();
        const selection = window.getSelection();
        let numeratorText = '';
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const startContainer = range.startContainer;
          const startOffset = range.startOffset;
          if (startContainer.nodeType === Node.TEXT_NODE) {
            numeratorText = startContainer.textContent.slice(0, startOffset).trim();
            startContainer.textContent = startContainer.textContent.slice(startOffset);
          } else if (startContainer === inputField || startContainer.parentNode === inputField) {
            const nodes = Array.from(inputField.childNodes);
            const currentNodeIndex = nodes.findIndex(node => 
              node === startContainer || node.contains(startContainer)
            );
            if (currentNodeIndex > 0) {
              const prevNode = nodes[currentNodeIndex - 1];
              if (prevNode.nodeType === Node.TEXT_NODE) {
                numeratorText = prevNode.textContent.trim();
                prevNode.remove();
              }
            }
          }
        }
        insertFraction(numeratorText);
        updatePlaceholderVisibility();
      }
      
      if (event.key === '^') {
        event.preventDefault();
        const selection = window.getSelection();
        let baseText = '';
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const startContainer = range.startContainer;
          const startOffset = range.startOffset;
  
          if (startContainer.nodeType === Node.TEXT_NODE) {
            baseText = startContainer.textContent.slice(0, startOffset).trim();
            startContainer.textContent = startContainer.textContent.slice(startOffset);
          } else if (startContainer === inputField || startContainer.parentNode === inputField) {
            const nodes = Array.from(inputField.childNodes);
            const currentNodeIndex = nodes.findIndex(node => 
              node === startContainer || node.contains(startContainer)
            );
            if (currentNodeIndex > 0) {
              const prevNode = nodes[currentNodeIndex - 1];
              if (prevNode.nodeType === Node.TEXT_NODE) {
                baseText = prevNode.textContent.trim();
                prevNode.remove();
              }
            }
          }
        }
  
        insertPower(baseText);
        updatePlaceholderVisibility();
      }
  });
  inputField.addEventListener('input', () => {
      updatePlaceholderVisibility();
      removeBreaks(inputField);
  });
  solveButton.addEventListener('click', () => handleSolve(inputField.textContent));
  mathButton.addEventListener('click', () => 
      toggleWithExclusive(mathButton, mathContainer, keyboardButton, keyboardContainer)
  );
  keyboardButton.addEventListener('click', () => 
      toggleWithExclusive(keyboardButton, keyboardContainer, mathButton, mathContainer)
  );
  setupMathKeys();
};

const removeBreaks = (element) => {
  element.querySelectorAll('br').forEach(br => br.remove());
};

const actionHandlers = {
  fraction: insertFraction,
  power: insertPower,
};

const handleMathKeyClick = (action) => {
  const insertFunction = actionHandlers[action];
  if (insertFunction) {
    insertFunction();
    updatePlaceholderVisibility();
  } else {
    console.warn(`No handler found for action: ${action}`);
  }
};

const setupMathKeys = () => {
  mathKeys.forEach((key) => {
    const action = key.dataset.action;
    if (action in actionHandlers) {
      key.addEventListener('click', () => handleMathKeyClick(action));
    }
  });
};