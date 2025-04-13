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
  numerator.addEventListener('keydown', e => {
      if (e.key === "ArrowRight") {
          const { selection, range } = getSelection();
          if (selection && isAtEnd(range, numerator)) {
              e.preventDefault();
              moveFocus(denominator, 0);
          }
      }
  });
  denominator.addEventListener('keydown', e => {
      if (e.key === "ArrowLeft") {
          const { selection, range } = getSelection();
          if (selection && isAtStart(range, denominator)) {
              e.preventDefault();
              moveFocus(numerator, 'end');
          }
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

