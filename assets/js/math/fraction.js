import { inputField } from "../constants.js";

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

  if (numeratorText) numerator.textContent = numeratorText

  setupFractionEvents(numerator, denominator);
  return fractionElement;
}

export const insertFraction = (numeratorText) => {
  const fractionElement = createFractionElement(numeratorText);
  const numerator = fractionElement.querySelector(".numerator");
  const denominator = fractionElement.querySelector(".denominator");
  const selection = window.getSelection();
  if (selection.rangeCount && inputField.contains(selection.getRangeAt(0).startContainer)) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(fractionElement);
    range.setStartBefore(fractionElement);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
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
}

const setupFractionEvents = (numerator, denominator) => {
  const fraction = numerator.closest('.fraction');
  let isFractionSelected = false;

  const handleBackspace = (element, e) => {
    if (e.key === 'Backspace' && element.textContent.trim() === '') {
      e.preventDefault();
      const otherElement = element === numerator ? denominator : numerator;
      const otherContent = otherElement.textContent.trim();

      if (otherContent) {
        const textNode = document.createTextNode(otherContent);
        fraction.parentNode.replaceChild(textNode, fraction);
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (isFractionSelected) {
        fraction.remove();
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStartBefore(fraction);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        fraction.classList.add('selected');
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(fraction);
        selection.removeAllRanges();
        selection.addRange(range);
        isFractionSelected = true;
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
      isFractionSelected = false;
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
      isFractionSelected = false;
    }
  });

  document.addEventListener('click', (e) => {
    if (!fraction.contains(e.target)) {
      fraction.classList.remove('selected');
      isFractionSelected = false;
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
}