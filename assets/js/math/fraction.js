import { inputField } from "../constants.js";
import { updatePlaceholderVisibility } from "../utils.js";

const handleInputFieldBackspace = (e) => {
  if (e.key === 'Backspace') {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      const startOffset = range.startOffset;

      const selectedFraction = inputField.querySelector('.fraction.selected');
      if (selectedFraction) {
        e.preventDefault();
        const parent = selectedFraction.parentNode;
        const nextSibling = selectedFraction.nextSibling;
        selectedFraction.remove();
        const newRange = document.createRange();
        if (nextSibling) {
          newRange.setStartBefore(nextSibling);
        } else if (parent) {
          newRange.setStart(parent, parent.childNodes.length);
        } else {
          newRange.setStart(inputField, 0);
        }
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        return;
      }

      if (
        startContainer.nodeType === Node.TEXT_NODE &&
        startContainer.parentNode === inputField &&
        startOffset > 0
      ) {
        return;
      }

      if (startContainer === inputField) {
        const nodes = Array.from(inputField.childNodes);
        if (startOffset > 0) {
          const prevNode = nodes[startOffset - 1];
          if (prevNode.nodeType === Node.TEXT_NODE) {
            e.preventDefault();
            if (prevNode.textContent.length > 0) {
              prevNode.textContent = prevNode.textContent.slice(0, -1);
              const newRange = document.createRange();
              newRange.setStart(prevNode, prevNode.textContent.length);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            } else {
              prevNode.remove();
              const newRange = document.createRange();
              newRange.setStart(inputField, startOffset - 1);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
            return;
          }
        }
      }

      let prevFraction = null;
      if (startContainer === inputField) {
        const nodes = Array.from(inputField.childNodes);
        for (let i = startOffset - 1; i >= 0; i--) {
          if (nodes[i] && nodes[i].classList && nodes[i].classList.contains('fraction')) {
            prevFraction = nodes[i];
            break;
          }
        }
      }

      if (prevFraction) {
        e.preventDefault();
        const numerator = prevFraction.querySelector('.numerator');
        const denominator = prevFraction.querySelector('.denominator');
        const numeratorContent = numerator.textContent.trim();
        const denominatorContent = denominator.textContent.trim();

        if (numeratorContent || denominatorContent) {
          moveFocus(denominator, 'end');
        } else {
          const allFractions = inputField.querySelectorAll('.fraction');
          allFractions.forEach(f => {
            f.classList.remove('selected');
            f.dataset.selected = 'false';
          });
          prevFraction.classList.add('selected');
          prevFraction.dataset.selected = 'true';
          const newRange = document.createRange();
          newRange.selectNode(prevFraction);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        return;
      }
    }
  }
};

inputField.addEventListener('keydown', handleInputFieldBackspace);

inputField.addEventListener('keydown', (event) => {
  handleSlashKey(event);
  updatePlaceholderVisibility();
});

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

  numerator.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') {
      handleBackspace(numerator, e);
    } else if (e.key === 'ArrowRight') {
      const { selection, range } = getSelection();
      if (selection && isAtEnd(range, numerator)) {
        e.preventDefault();
        moveFocus(denominator, 0);
      }
    }
    if (e.key !== 'Backspace') {
      fraction.classList.remove('selected');
      fraction.dataset.selected = 'false';
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
    }
    if (e.key !== 'Backspace') {
      fraction.classList.remove('selected');
      fraction.dataset.selected = 'false';
    }
  });

  document.addEventListener('click', (e) => {
    if (!fraction.contains(e.target)) {
      fraction.classList.remove('selected');
      fraction.dataset.selected = 'false';
    }
  });
};

const getSelection = () => {
  const selection = window.getSelection();
  return {
    selection: selection.rangeCount > 0 ? selection : null,
    range: selection.rangeCount > 0 ? selection.getRangeAt(0) : null
  };
};

const isAtEnd = (range, element) =>
  range.endContainer === element
    ? range.endOffset === element.childNodes.length
    : range.endContainer.nodeType === Node.TEXT_NODE
      && range.endOffset === range.endContainer.textContent.length
      && !range.endContainer.nextSibling;

const isAtStart = (range, element) =>
  range.startContainer === element
    ? range.startOffset === 0
    : range.startContainer.nodeType === Node.TEXT_NODE
      && range.startOffset === 0
      && !range.startContainer.previousSibling;

const moveFocus = (target, position) => {
  target.focus();
  const selection = window.getSelection();
  const newRange = document.createRange();

  if (position === 'end') {
    if (target.childNodes.length === 0) {
      newRange.setStart(target, 0);
    } else if (target.firstChild.nodeType === Node.TEXT_NODE) {
      newRange.setStart(target.firstChild, target.firstChild.textContent.length);
    } else {
      newRange.selectNodeContents(target);
      newRange.collapse(false);
    }
  } else {
    newRange.setStart(target, position);
  }

  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);
};

export function parseFractions(forDisplay = false) {
  let expression = '';
  const nodes = inputField.childNodes;

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      expression += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('fraction')) {
      const numerator = node.querySelector('.numerator').textContent.trim();
      const denominator = node.querySelector('.denominator').textContent.trim();
      if (numerator && denominator) {
        const hasOperators = (str) => /[+\-*/]/.test(str);
        const formattedNumerator = hasOperators(numerator) ? `(${numerator})` : numerator;
        const formattedDenominator = hasOperators(denominator) ? `(${denominator})` : denominator;
        const fractionPart = `${formattedNumerator}/${formattedDenominator}`;
        if (forDisplay) {
          expression += `(${fractionPart})`;
        } else {
          expression += `(${formattedNumerator}/${formattedDenominator})`;
        }
      } else {
        throw new Error('Числитель или знаменатель дроби пустой');
      }
    }
  });
  return expression.trim();
};