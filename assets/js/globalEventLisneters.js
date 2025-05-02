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
import { insertFraction, insertSqrt, insertCbrt, insertPower, insertTrig, handleSlashKey } from './math/mathElements.js';
import { removeLoader } from './loader.js';

const handleSolve = (expression) => solve(expression.trim());

const toggleAdditionalButtons = (clickedButton) => {
  const buttons = document.querySelectorAll('.toolbar__button-additional');
  const favouriteContainer = document.querySelector('.mathInput__container-favourite');
  const trigonometricContainer = document.querySelector('.mathInput__container-trigonometric');
  
  buttons.forEach(button => {
    if (button === clickedButton) {
      button.classList.add('active');
      if (button.dataset.set === 'favourite') {
        favouriteContainer.style.display = 'flex';
        trigonometricContainer.style.display = 'none';
      } else if (button.dataset.set === 'trigonometric') {
        favouriteContainer.style.display = 'none';
        trigonometricContainer.style.display = 'flex';
      }
    } else {
      button.classList.remove('active');
    }
  });
};

const toggleWithExclusive = (button, container, otherButton, otherContainer) => {
  toggle(button);
  toggle(container);
  if (otherButton.classList.contains("active")) {
    toggle(otherButton);
    toggle(otherContainer);
  }
  if (button === mathButton && button.classList.contains("active")) {
    show(additional);
    const favouriteButton = document.querySelector('[data-set="favourite"]');
    if (favouriteButton) {
      favouriteButton.classList.add('active');
      const favouriteContainer = document.querySelector('.mathInput__container-favourite');
      const trigonometricContainer = document.querySelector('.mathInput__container-trigonometric');
      favouriteContainer.style.display = 'flex';
      trigonometricContainer.style.display = 'none';
    }
  } else {
    hide(additional);
    const buttons = document.querySelectorAll('.toolbar__button-additional');
    buttons.forEach(button => button.classList.remove('active'));
    const favouriteContainer = document.querySelector('.mathInput__container-favourite');
    const trigonometricContainer = document.querySelector('.mathInput__container-trigonometric');
    favouriteContainer.style.display = 'none';
    trigonometricContainer.style.display = 'none';
  }
};

const removeBreaks = (element) => {
  element.querySelectorAll('br').forEach(br => br.remove());
};

const removeEmptyDivs = (element) => {
  element.querySelectorAll('div').forEach(div => {
    const hasContent = div.textContent.trim() !== '' || 
      div.querySelector('span.fraction') || 
      div.querySelector('span.power') || 
      div.querySelector('span.sqrt') || 
      div.querySelector('span.cbrt') || 
      div.querySelector('span.trig-func');
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
  
  const additionalButtons = document.querySelectorAll('.toolbar__button-additional');
  additionalButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (mathButton.classList.contains('active')) {
        toggleAdditionalButtons(button);
      }
    });
  });

  const trigContainer = document.querySelector('.mathInput__container-trigonometric');
  if (trigContainer) {
    trigContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.mathInput__key');
      if (!btn) return;
      const img = btn.querySelector('img');
      if (!img) return;
      const src = img.src;
      let func = null, isInverse = false, isHyperbolic = false;
      if (src.includes('sin_inv')) { func = 'sin'; isInverse = true; }
      else if (src.includes('cos_inv')) { func = 'cos'; isInverse = true; }
      else if (src.includes('tan_inv')) { func = 'tan'; isInverse = true; }
      else if (src.includes('sinh_inv')) { func = 'sin'; isInverse = true; isHyperbolic = true; }
      else if (src.includes('cosh_inv')) { func = 'cos'; isInverse = true; isHyperbolic = true; }
      else if (src.includes('tanh_inv')) { func = 'tan'; isInverse = true; isHyperbolic = true; }
      else if (src.includes('sech_inv')) { func = 'sec'; isInverse = true; isHyperbolic = true; }
      else if (src.includes('csch_inv')) { func = 'csc'; isInverse = true; isHyperbolic = true; }
      else if (src.includes('coth_inv')) { func = 'cot'; isInverse = true; isHyperbolic = true; }
      else if (src.includes('sinh')) { func = 'sin'; isHyperbolic = true; }
      else if (src.includes('cosh')) { func = 'cos'; isHyperbolic = true; }
      else if (src.includes('tanh')) { func = 'tan'; isHyperbolic = true; }
      else if (src.includes('sech')) { func = 'sec'; isHyperbolic = true; }
      else if (src.includes('csch')) { func = 'csc'; isHyperbolic = true; }
      else if (src.includes('coth')) { func = 'cot'; isHyperbolic = true; }
      else if (src.includes('sin')) { func = 'sin'; }
      else if (src.includes('cos')) { func = 'cos'; }
      else if (src.includes('tan')) { func = 'tan'; }
      else if (src.includes('sec')) { func = 'sec'; }
      else if (src.includes('csc')) { func = 'csc'; }
      else if (src.includes('cot')) { func = 'cot'; }
      if (func) {
        insertTrig(func, isInverse, isHyperbolic);
      }
    });
  }

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