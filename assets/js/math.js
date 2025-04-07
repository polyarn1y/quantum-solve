import { inputField } from "./constants.js";

const fractionHTML = `
  <span class="fraction" contenteditable="false">
    <span class="numerator" contenteditable="true">1</span>
    <span class="line"></span>
    <span class="denominator" contenteditable="true">2</span>
  </span>
`;

function createFractionElement() {
  const fraction = document.createElement('span');
  fraction.innerHTML = fractionHTML.trim();
  const fractionElement = fraction.firstChild;

  const numerator = fractionElement.querySelector(".numerator");
  const denominator = fractionElement.querySelector(".denominator");

  [numerator, denominator].forEach((element) => {
    element.addEventListener("click", (e) => {
      e.stopPropagation();
      element.focus();
    });
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        element.blur();
      }
      if (e.key === 'ArrowLeft' && element === numerator) {
        e.preventDefault();
        inputField.focus();
        const range = document.createRange();
        range.setStartBefore(fractionElement);
        range.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      if (e.key === 'ArrowRight' && element === denominator) {
        e.preventDefault();
        inputField.focus();
        const range = document.createRange();
        range.setStartAfter(fractionElement);
        range.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
      if (e.key === 'ArrowRight' && element === numerator) {
        e.preventDefault();
        denominator.focus();
      }
      if (e.key === 'ArrowLeft' && element === denominator) {
        e.preventDefault();
        numerator.focus();
      }

      if (e.key === 'ArrowUp' && element === denominator) {
        e.preventDefault();
        numerator.focus();
      }
      if (e.key === 'ArrowDown' && element === numerator) {
        e.preventDefault();
        denominator.focus(); // Переход вниз от числителя к знаменателю
      }
    });
    element.addEventListener('beforeinput', (e) => {
      if (e.inputType === 'insertParagraph') {
        e.preventDefault();
      }
    });
  });

  return fractionElement;
}

export function insertFraction() {
  inputField.focus();
  const fractionElement = createFractionElement();
  const selection = window.getSelection();

  if (selection.rangeCount > 0 && inputField.contains(selection.getRangeAt(0).startContainer)) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(fractionElement);
    // Оставляем курсор перед дробью для возможности писать до неё
    range.setStartBefore(fractionElement);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    inputField.appendChild(fractionElement);
    const range = document.createRange();
    range.setStartBefore(fractionElement); // Ставим курсор перед дробью
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// Удаление дроби
inputField.addEventListener('keydown', (e) => {
  const selection = window.getSelection();
  if ((e.key === 'Backspace' || e.key === 'Delete') && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    if (startContainer.parentNode?.className === 'fraction' || 
        endContainer.parentNode?.className === 'fraction') {
      const fraction = startContainer.parentNode.className === 'fraction' 
        ? startContainer.parentNode 
        : endContainer.parentNode;
      if (range.toString().includes(fraction.textContent)) {
        fraction.remove();
        e.preventDefault();
      }
    }
  }
  // Управление стрелками вне дроби
  if (e.key === 'ArrowRight' && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const nextNode = range.endContainer.nextSibling;
    if (nextNode?.className === 'fraction') {
      e.preventDefault();
      nextNode.querySelector('.numerator').focus(); // Входим в дробь справа
    }
  }
  if (e.key === 'ArrowLeft' && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const prevNode = range.startContainer.previousSibling;
    if (prevNode?.className === 'fraction') {
      e.preventDefault();
      prevNode.querySelector('.denominator').focus(); // Входим в дробь слева
    }
  }
});

inputField.addEventListener('keydown', (e) => {
  const selection = window.getSelection();
  if ((e.key === 'Backspace' || e.key === 'Delete') && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;

      if (startContainer.parentNode?.className === 'fraction' || 
          endContainer.parentNode?.className === 'fraction') {
          const fraction = startContainer.parentNode.className === 'fraction' 
              ? startContainer.parentNode 
              : endContainer.parentNode;
          
          if (range.toString().includes(fraction.textContent)) {
              fraction.remove();
              e.preventDefault();
          }
      }
  }
});