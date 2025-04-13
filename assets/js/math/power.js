import { inputField } from "../constants.js";

const POWER_TEMPLATE = `
  <span class="power" contenteditable="false">
      <span class="base" contenteditable="true"></span>
      <span class="exponent" contenteditable="true"></span>
    </span>
`.trim();

const createPowerElement = (baseText) => {
  const template = document.createElement('span');
  template.innerHTML = POWER_TEMPLATE;
  const fractionElement = template.firstChild;
  const base = fractionElement.querySelector(".base");
  const exponent = fractionElement.querySelector(".exponent");

  if (baseText) base.textContent = baseText

  setupPowerEvents(base, exponent);
  return fractionElement;
}

export const insertPower = (baseText) => {
  const fractionElement = createPowerElement(baseText);
  const base = fractionElement.querySelector(".base");
  const exponent = fractionElement.querySelector(".exponent");
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
  if (baseText) {
    exponent.focus(); 
  } else {
    base.focus();
  }
}

const setupPowerEvents = (base, exponent) => {
  base.addEventListener('keydown', e => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          const { selection, range } = getSelection();
          if (selection && isAtEnd(range, base)) {
              e.preventDefault();
              moveFocus(exponent, 0);
          }
      }
  });
  exponent.addEventListener('keydown', e => {
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          const { selection, range } = getSelection();
          if (selection && isAtStart(range, exponent)) {
              e.preventDefault();
              moveFocus(base, 'end');
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

