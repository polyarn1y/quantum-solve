import { inputField } from "../constants.js";
import { updatePlaceholderVisibility } from "../utils.js";
import { getSelection, isAtEnd, isAtStart, moveFocus } from "./inputFieldBackspaceHandler.js";

const FRACTION_TEMPLATE = `
  <span class="fraction" contenteditable="false">
    <span class="numerator" contenteditable="true"></span>
    <span class="line" contenteditable="false"></span>
    <span class="denominator" contenteditable="true"></span>
  </span>
`.trim();

const createFractionElement = (numeratorText) => {
  const template = document.createElement('span');
  template.innerHTML = FRACTION_TEMPLATE;
  const fractionElement = template.firstChild;
  const numerator = fractionElement.querySelector(".numerator");
  const denominator = fractionElement.querySelector(".denominator");

  if (numeratorText) numerator.textContent = numeratorText;

  setupFractionEvents(numerator, denominator);
  return fractionElement;
};

export const insertFraction = (numeratorText) => {
  const fractionElement = createFractionElement(numeratorText);
  const numerator = fractionElement.querySelector(".numerator");
  const denominator = fractionElement.querySelector(".denominator");
  const selection = window.getSelection();
  if (selection.rangeCount && inputField.contains(selection.getRangeAt(0).startContainer)) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(fractionElement);
    
    const newRange = document.createRange();
    newRange.setStartAfter(fractionElement);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  } else {
    inputField.appendChild(fractionElement);
    const range = document.createRange();
    range.setStartAfter(fractionElement);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  if (numeratorText) {
    denominator.focus();
  } else {
    numerator.focus();
  }
};

export const handleSlashKey = (event) => {
  if (event.key === '/') {
    event.preventDefault();
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;
    
    if (startContainer.closest && startContainer.closest('.fraction')) {
      return;
    }
    
    let numeratorText = '';
    let textToPreserve = '';
    
    if (startContainer.nodeType === Node.TEXT_NODE) {
      const fullText = startContainer.textContent;
      const textBeforeCursor = fullText.substring(0, startOffset);
      
      if (textBeforeCursor) {
        const lastOpenParen = textBeforeCursor.lastIndexOf('(');
        const lastCloseParen = textBeforeCursor.lastIndexOf(')');
        
        if (lastCloseParen === textBeforeCursor.length - 1 && lastOpenParen !== -1 && lastOpenParen < lastCloseParen) {
          const matchingOpenParen = findMatchingOpenParen(textBeforeCursor, lastCloseParen);
          if (matchingOpenParen !== -1) {
            numeratorText = textBeforeCursor.substring(matchingOpenParen + 1, lastCloseParen);
            textToPreserve = textBeforeCursor.substring(0, matchingOpenParen);
          } else {
            numeratorText = textBeforeCursor;
            textToPreserve = '';
          }
        } else if (lastOpenParen > lastCloseParen && lastOpenParen !== -1) {
          numeratorText = textBeforeCursor.substring(lastOpenParen + 1);
          textToPreserve = textBeforeCursor.substring(0, lastOpenParen + 1);
        } else {
          const operators = ['+', '-', '*', '/'];
          let lastOperatorIndex = -1;
          
          for (const op of operators) {
            const index = textBeforeCursor.lastIndexOf(op);
            if (index > lastOperatorIndex) {
              lastOperatorIndex = index;
            }
          }
          
          if (lastOperatorIndex !== -1) {
            numeratorText = textBeforeCursor.substring(lastOperatorIndex + 1);
            textToPreserve = textBeforeCursor.substring(0, lastOperatorIndex + 1);
          } else {
            numeratorText = textBeforeCursor;
            textToPreserve = '';
          }
        }
      }
      
      const textAfterCursor = fullText.substring(startOffset);
      
      startContainer.textContent = '';
      
      if (textToPreserve) {
        const preservedTextNode = document.createTextNode(textToPreserve);
        startContainer.parentNode.insertBefore(preservedTextNode, startContainer);
      }
      
      const fractionElement = createFractionElement(numeratorText.trim());
      
      startContainer.parentNode.insertBefore(fractionElement, startContainer);
      
      if (textAfterCursor) {
        const afterCursorNode = document.createTextNode(textAfterCursor);
        startContainer.parentNode.insertBefore(afterCursorNode, startContainer);
      }
      
      if (!startContainer.textContent) {
        startContainer.remove();
      }
      
      if (numeratorText.trim()) {
        fractionElement.querySelector('.denominator').focus();
      } else {
        fractionElement.querySelector('.numerator').focus();
      }
    } else {
      const fractionElement = createFractionElement('');
      range.deleteContents();
      range.insertNode(fractionElement);
      fractionElement.querySelector('.numerator').focus();
    }
  }
};

inputField.addEventListener('keydown', (event) => {
  handleSlashKey(event);
  updatePlaceholderVisibility();
});

const setupFractionEvents = (numerator, denominator) => {
  const fraction = numerator.closest('.fraction');

  const handleBackspace = (element, e) => {
    if (e.key === 'Backspace' && element.textContent.trim() === '') {
      e.preventDefault();
      const otherElement = element === numerator ? denominator : numerator;
      const otherContent = otherElement.textContent.trim();

      if (otherContent) {
        const fraction = element.closest('.fraction');
        const prevSibling = fraction.previousSibling;
        const nextSibling = fraction.nextSibling;

        let targetTextNode;

        if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
          targetTextNode = prevSibling;
          targetTextNode.textContent += otherContent;
        } else if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
          targetTextNode = nextSibling;
          targetTextNode.textContent = otherContent + targetTextNode.textContent;
        } else {
          targetTextNode = document.createTextNode(otherContent);
          fraction.parentNode.insertBefore(targetTextNode, fraction);
        }

        fraction.remove();

        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(targetTextNode, targetTextNode.textContent.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (fraction.dataset.selected === 'true') {
        e.preventDefault();
        const parent = fraction.parentNode;
        const nextSibling = fraction.nextSibling;
        fraction.remove();
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
        const allFractions = inputField.querySelectorAll('.fraction');
        allFractions.forEach(f => {
          f.classList.remove('selected');
          f.dataset.selected = 'false';
        });
        fraction.classList.add('selected');
        fraction.dataset.selected = 'true';
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(fraction);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const removeSelection = () => {
    fraction.classList.remove('selected');
    fraction.dataset.selected = 'false';
  };

  numerator.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      handleBackspace(numerator, e);
    } else if (e.key === 'ArrowRight') {
      const { selection, range } = getSelection();
      if (selection && isAtEnd(range, numerator)) {
        e.preventDefault();
        moveFocus(denominator, 0);
      }
      removeSelection();
    } else if (e.key !== 'Backspace') {
      removeSelection();
    }
  });

  denominator.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      handleBackspace(denominator, e);
    } else if (e.key === 'ArrowLeft') {
      const { selection, range } = getSelection();
      if (selection && isAtStart(range, denominator)) {
        e.preventDefault();
        moveFocus(numerator, 'end');
      }
      removeSelection();
    } else if (e.key !== 'Backspace') {
      removeSelection();
    }
  });

  document.addEventListener('click', (e) => {
    if (!fraction.contains(e.target)) {
      removeSelection();
    }
  });
};