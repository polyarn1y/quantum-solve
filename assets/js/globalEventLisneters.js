import { 
  inputField,
  solveButton,
  keyboardButton,
  keyboardContainer,
  mathButton,
  mathContainer,
  mathKeys,
  additional
} from "./constants.js";
import { solve } from "./index.js";
import { toggle, updatePlaceholderVisibility, show, hide } from "./utils.js";
import { insertFraction, insertSqrt, insertCbrt, insertPower, handleSlashKey } from './math/mathElements.js';
import { removeLoader } from './loader.js';

const handleSolve = (expression) => solve(expression.trim());
const toggleWithExclusive = (button, container, otherButton, otherContainer) => {
  toggle(button);
  toggle(container);
  if (otherButton.classList.contains("active")) {
    toggle(otherButton);
    toggle(otherContainer);
  }
  if (button === mathButton && button.classList.contains("active")) {
    show(additional);
  } else {
    hide(additional);
  }
};

const removeBreaks = (element) => {
  element.querySelectorAll('br').forEach(br => br.remove());
};

const removeEmptyDivs = (element) => {
  element.querySelectorAll('div').forEach(div => {
    const hasContent = div.textContent.trim() !== '' || div.querySelector('span.fraction') || div.querySelector('span.power') || div.querySelector('span.sqrt') || div.querySelector('span.cbrt');
    if (!hasContent) {
      div.remove();
    }
  });

  if (!element.childNodes.length) {
    element.appendChild(document.createTextNode(''));
  }
};

export const addGlobalEventListeners = () => {
  window.addEventListener("load", removeLoader);
  inputField.addEventListener('paste', (event) => {
    event.preventDefault();
    const text = (event.clipboardData || window.clipboardData).getData('text/plain');    
    document.execCommand('insertText', false, text);
    updatePlaceholderVisibility();
    removeBreaks(inputField);
    removeEmptyDivs(inputField);
  });
  inputField.addEventListener('keypress', (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSolve(inputField.textContent);
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
      removeBreaks(inputField);
      removeEmptyDivs(inputField);
    }
  });
  inputField.addEventListener('input', () => {
    updatePlaceholderVisibility();
    removeBreaks(inputField);
    removeEmptyDivs(inputField);
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

const actionHandlers = {
  fraction: insertFraction,
  power: insertPower,
  sqrt: insertSqrt,
  cube: insertCbrt,
};

const handleMathKeyClick = (action) => {
  const insertFunction = actionHandlers[action];
  if (insertFunction) {
    insertFunction();
    updatePlaceholderVisibility();
    removeBreaks(inputField);
    removeEmptyDivs(inputField);
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