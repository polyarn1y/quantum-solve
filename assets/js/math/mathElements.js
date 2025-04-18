import { inputField } from "../constants.js";
import { updatePlaceholderVisibility } from "../utils.js";
import { getSelection, isAtEnd, isAtStart, moveFocus } from "./inputFieldBackspaceHandler.js";

const TEMPLATES = {
  fraction: `
    <span class="fraction" contenteditable="false">
      <span class="numerator" contenteditable="true"></span>
      <span class="line" contenteditable="false"></span>
      <span class="denominator" contenteditable="true"></span>
    </span>
  `.trim(),
  sqrt: `
    <span class="sqrt" contenteditable="false">
      <span class="sqrt-symbol" contenteditable="false">
        <img src="assets/images/math/root_symbol.svg" alt="">
      </span>
      <span class="sqrt-content" contenteditable="true"></span>
    </span>
  `.trim(),
  cbrt: `
    <span class="cbrt" contenteditable="false">
      <span class="cbrt-index" contenteditable="false">3</span>
      <span class="cbrt-symbol" contenteditable="false">
        <img src="assets/images/math/root_symbol.svg" alt="">
      </span>
      <span class="cbrt-content" contenteditable="true"></span>
    </span>
  `.trim(),
  power: `
    <span class="power" contenteditable="false">
      <span class="base" contenteditable="true"></span>
      <span class="exponent" contenteditable="true"></span>
    </span>
  `.trim(),
};

const ELEMENT_CONFIG = {
  fraction: {
    editableFields: ["numerator", "denominator"],
    focusField: (hasContent) => (hasContent ? "denominator" : "numerator"),
    navigation: {
      firstToSecond: { keys: ["ArrowRight"], condition: isAtEnd },
      secondToFirst: { keys: ["ArrowLeft"], condition: isAtStart },
    },
  },
  sqrt: {
    editableFields: ["sqrt-content"],
    focusField: () => "sqrt-content",
  },
  cbrt: {
    editableFields: ["cbrt-content"],
    focusField: () => "cbrt-content",
  },
  power: {
    editableFields: ["base", "exponent"],
    focusField: (hasContent) => (hasContent ? "exponent" : "base"),
    navigation: {
      firstToSecond: { keys: ["ArrowRight", "ArrowUp"], condition: isAtEnd },
      secondToFirst: { keys: ["ArrowLeft", "ArrowDown"], condition: isAtStart },
    },
  },
};

const createMathElement = (type, content = {}) => {
  const template = document.createElement('span');
  template.innerHTML = TEMPLATES[type];
  const element = template.firstChild;

  const config = ELEMENT_CONFIG[type];
  const fields = {};

  config.editableFields.forEach((fieldName, index) => {
    const field = element.querySelector(`.${fieldName}`);
    const contentKey = index === 0 ? "first" : "second";
    if (content[contentKey]) {
      if (typeof content[contentKey] === 'string') {
        field.textContent = content[contentKey];
      } else {
        field.appendChild(content[contentKey]);
      }
    }
    fields[fieldName] = field;
  });

  setupMathElementEvents(type, fields);
  return element;
};

const insertMathElement = (type, content = {}) => {
  const element = createMathElement(type, content);
  const config = ELEMENT_CONFIG[type];
  const focusFieldName = config.focusField(!!content.first);
  const focusField = element.querySelector(`.${focusFieldName}`);

  const selection = window.getSelection();
  if (selection.rangeCount && inputField.contains(selection.getRangeAt(0).startContainer)) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(element);
    const newRange = document.createRange();
    newRange.setStartAfter(element);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  } else {
    inputField.appendChild(element);
    const range = document.createRange();
    range.setStartAfter(element);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  const range = document.createRange();
  range.setStart(focusField, 0);
  range.setEnd(focusField, 0);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  focusField.focus();

  updatePlaceholderVisibility();
};

export const insertFraction = (numeratorText) => insertMathElement("fraction", { first: numeratorText });
export const insertSqrt = (contentText) => insertMathElement("sqrt", { first: contentText });
export const insertCbrt = (contentText) => insertMathElement("cbrt", { first: contentText });
export const insertPower = (baseText) => insertMathElement("power", { first: baseText });

const setupMathElementEvents = (type, fields) => {
  const config = ELEMENT_CONFIG[type];
  const element = fields[config.editableFields[0]].closest(`.${type}`);

  const handleBackspace = (field, e) => {
    if (e.key === 'Backspace' && field.textContent.trim() === '') {
      e.preventDefault();
      let otherContent = '';
      let otherField = null;

      if (config.editableFields.length > 1) {
        const otherFieldName = field.classList.contains(config.editableFields[0])
          ? config.editableFields[1]
          : config.editableFields[0];
        otherField = fields[otherFieldName];
        otherContent = otherField.textContent.trim();
      }

      if (otherContent) {
        const prevSibling = element.previousSibling;
        const nextSibling = element.nextSibling;
        let targetTextNode;

        if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
          targetTextNode = prevSibling;
          targetTextNode.textContent += otherContent;
        } else if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
          targetTextNode = nextSibling;
          targetTextNode.textContent = otherContent + targetTextNode.textContent;
        } else {
          targetTextNode = document.createTextNode(otherContent);
          element.parentNode.insertBefore(targetTextNode, element);
        }

        element.remove();

        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(targetTextNode, targetTextNode.textContent.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (element.dataset.selected === 'true') {
        const parent = element.parentNode;
        const nextSibling = element.nextSibling;
        element.remove();
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
        const allElements = inputField.querySelectorAll(`.${type}`);
        allElements.forEach(el => {
          el.classList.remove('selected');
          el.dataset.selected = 'false';
        });
        element.classList.add('selected');
        element.dataset.selected = 'true';
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(element);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const removeSelection = () => {
    element.classList.remove('selected');
    element.dataset.selected = 'false';
  };

  config.editableFields.forEach((fieldName, index) => {
    const field = fields[fieldName];
    field.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        handleBackspace(field, e);
      } else if (config.navigation && config.editableFields.length > 1) {
        const isFirstField = index === 0;
        const navConfig = isFirstField ? config.navigation.firstToSecond : config.navigation.secondToFirst;
        if (navConfig.keys.includes(e.key)) {
          const { selection, range } = getSelection();
          if (selection && navConfig.condition(range, field)) {
            e.preventDefault();
            const targetFieldName = isFirstField ? config.editableFields[1] : config.editableFields[0];
            const targetField = fields[targetFieldName];
            const position = isFirstField ? 0 : 'end';
            moveFocus(targetField, position);
          }
          removeSelection();
        } else if (e.key !== 'Backspace') {
          removeSelection();
        }
      } else if (e.key !== 'Backspace') {
        removeSelection();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!element.contains(e.target)) {
      removeSelection();
    }
  });
};

const getContainerElement = (node) =>
  node.nodeType === Node.TEXT_NODE ? node.parentElement : node;

const findMatchingOpenParen = (text, closeIndex) => {
  let depth = 0;
  for (let i = closeIndex - 1; i >= 0; i--) {
    if (text[i] === ')') depth++;
    else if (text[i] === '(') {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
};

export const handleSlashKey = (event) => {
  if (event.key === '/') {
    event.preventDefault();

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const rawStartContainer = range.startContainer;
    const startContainer = getContainerElement(rawStartContainer);
    const startOffset = range.startOffset;

    const currentFraction = startContainer.closest('.fraction');
    if (currentFraction) {
      const numerator = currentFraction.querySelector('.numerator');
      if (
        startContainer === numerator ||
        numerator.contains(rawStartContainer)
      ) {
        const newFraction = createMathElement("fraction", { first: currentFraction.cloneNode(true) });
        const parent = currentFraction.parentNode;
        parent.insertBefore(newFraction, currentFraction.nextSibling);
        currentFraction.remove();

        const newNumerator = newFraction.querySelector('.numerator');
        const nestedFraction = newNumerator.querySelector('.fraction');
        let focusElement;
        if (nestedFraction) {
          focusElement = nestedFraction.querySelector('.numerator');
        } else {
          focusElement = newNumerator;
        }

        const newRange = document.createRange();
        newRange.setStart(focusElement, 0);
        newRange.setEnd(focusElement, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        focusElement.focus();
        return;
      }
    }

    let numeratorText = '';
    let textToPreserve = '';

    if (rawStartContainer.nodeType === Node.TEXT_NODE) {
      const fullText = rawStartContainer.textContent;
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

      rawStartContainer.textContent = '';

      if (textToPreserve) {
        const preservedTextNode = document.createTextNode(textToPreserve);
        rawStartContainer.parentNode.insertBefore(preservedTextNode, rawStartContainer);
      }

      const fractionElement = createMathElement("fraction", { first: numeratorText.trim() });
      rawStartContainer.parentNode.insertBefore(fractionElement, rawStartContainer);

      if (textAfterCursor) {
        const afterCursorNode = document.createTextNode(textAfterCursor);
        rawStartContainer.parentNode.insertBefore(afterCursorNode, rawStartContainer);
      }

      if (!rawStartContainer.textContent) {
        rawStartContainer.remove();
      }

      const focusField = numeratorText.trim()
        ? fractionElement.querySelector('.denominator')
        : fractionElement.querySelector('.numerator');
      const newRange = document.createRange();
      newRange.setStart(focusField, 0);
      newRange.setEnd(focusField, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      focusField.focus();
    } else {
      const fractionElement = createMathElement("fraction");
      range.deleteContents();
      range.insertNode(fractionElement);
      const numerator = fractionElement.querySelector('.numerator');
      const newRange = document.createRange();
      newRange.setStart(numerator, 0);
      newRange.setEnd(numerator, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      numerator.focus();
    }
  }
};

inputField.addEventListener('keydown', (event) => {
  handleSlashKey(event);
  updatePlaceholderVisibility();
});