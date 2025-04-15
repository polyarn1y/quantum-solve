import { inputField } from "../constants.js";
import { getSelection, isAtEnd, isAtStart, moveFocus } from "./inputFieldBackspaceHandler.js";

const POWER_TEMPLATE = `
  <span class="power" contenteditable="false">
      <span class="base" contenteditable="true"></span>
      <span class="exponent" contenteditable="true"></span>
    </span>
`.trim();

const createPowerElement = (baseText) => {
  const template = document.createElement('span');
  template.innerHTML = POWER_TEMPLATE;
  const powerElement = template.firstChild;
  const base = powerElement.querySelector(".base");
  const exponent = powerElement.querySelector(".exponent");

  if (baseText) base.textContent = baseText;

  setupPowerEvents(base, exponent);
  return powerElement;
};

export const insertPower = (baseText) => {
  const powerElement = createPowerElement(baseText);
  const base = powerElement.querySelector(".base");
  const exponent = powerElement.querySelector(".exponent");
  const selection = window.getSelection();
  if (selection.rangeCount && inputField.contains(selection.getRangeAt(0).startContainer)) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(powerElement);
    const newRange = document.createRange();
    newRange.setStartAfter(powerElement);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  } else {
    inputField.appendChild(powerElement);
    const range = document.createRange();
    range.setStartAfter(powerElement);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);   
  }
  if (baseText) {
    exponent.focus(); 
  } else {
    base.focus();
  }
};

const setupPowerEvents = (base, exponent) => {
  const power = base.closest('.power');

  const handleBackspace = (element, e) => {
    if (e.key === 'Backspace' && element.textContent.trim() === '') {
      e.preventDefault();
      const otherElement = element === base ? exponent : base;
      const otherContent = otherElement.textContent.trim();

      if (otherContent) {
        const prevSibling = power.previousSibling;
        const nextSibling = power.nextSibling;
        let targetTextNode;

        if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
          targetTextNode = prevSibling;
          targetTextNode.textContent += otherContent;
        } else if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
          targetTextNode = nextSibling;
          targetTextNode.textContent = otherContent + targetTextNode.textContent;
        } else {
          targetTextNode = document.createTextNode(otherContent);
          power.parentNode.insertBefore(targetTextNode, power);
        }

        power.remove();

        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(targetTextNode, targetTextNode.textContent.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (power.dataset.selected === 'true') {
        e.preventDefault();
        const parent = power.parentNode;
        const nextSibling = power.nextSibling;
        power.remove();
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
        const allPowers = inputField.querySelectorAll('.power');
        allPowers.forEach(p => {
          p.classList.remove('selected');
          p.dataset.selected = 'false';
        });
        power.classList.add('selected');
        power.dataset.selected = 'true';
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(power);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const removeSelection = () => {
    power.classList.remove('selected');
    power.dataset.selected = 'false';
  };

  base.addEventListener('keydown', e => {
    if (e.key === 'Backspace') {
      handleBackspace(base, e);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      const { selection, range } = getSelection();
      if (selection && isAtEnd(range, base)) {
        e.preventDefault();
        moveFocus(exponent, 0);
      }
      removeSelection();
    } else if (e.key !== 'Backspace') {
      removeSelection();
    }
  });

  exponent.addEventListener('keydown', e => {
    if (e.key === 'Backspace') {
      handleBackspace(exponent, e);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      const { selection, range } = getSelection();
      if (selection && isAtStart(range, exponent)) {
        e.preventDefault();
        moveFocus(base, 'end');
      }
      removeSelection();
    } else if (e.key !== 'Backspace') {
      removeSelection();
    }
  });

  document.addEventListener('click', (e) => {
    if (!power.contains(e.target)) {
      removeSelection();
    }
  });
};