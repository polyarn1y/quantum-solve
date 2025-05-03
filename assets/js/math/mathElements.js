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
  trig: `
    <span class="trig-func" contenteditable="false" data-selected="false">
      <span class="trig-name" contenteditable="false"></span>
      <span class="trig-paren" contenteditable="false">(</span>
      <span class="trig-content" contenteditable="true"></span>
      <span class="trig-paren" contenteditable="false">)</span>
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
  trig: {
    editableFields: ["trig-content"],
    focusField: () => "trig-content",
  },
};

const getRootNesting = (element) => {
  let nestingLevel = 0;
  let currentElement = element;

  while (currentElement && currentElement !== inputField) {
    if (currentElement.classList && 
        (currentElement.classList.contains('sqrt') || currentElement.classList.contains('cbrt'))) {
      nestingLevel++;
    }
    currentElement = currentElement.parentElement;
  }
  return nestingLevel;
};

const getParentRoot = (element) => {
  let currentElement = element.parentElement;

  while (currentElement && currentElement !== inputField) {
      if (currentElement.classList && 
          (currentElement.classList.contains('sqrt') || currentElement.classList.contains('cbrt'))) {
          return currentElement;
      }
      currentElement = currentElement.parentElement;
  }
  return null;
};

const updateRootContentClasses = (field) => {
  let hasDigit = false;
  let hasRoot = false;
  let isPowerEmpty = false;
  let hasExponent = false;

  field.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && /\d/.test(node.textContent)) {
      hasDigit = true;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList.contains('sqrt') || node.classList.contains('cbrt')) {
        hasRoot = true;
      }
      if (node.classList.contains('power')) {
        hasExponent = true;
        const base = node.querySelector('.base');
        const exponent = node.querySelector('.exponent');
        isPowerEmpty = (!base || base.textContent.trim() === '') && (!exponent || exponent.textContent.trim() === ''); 
      }
    }
  });

  field.classList.toggle('has-numbers', hasDigit);
  field.classList.toggle('has-root', hasRoot);
  field.classList.toggle('has-exponent', hasExponent);
  field.classList.toggle('empty', isPowerEmpty);
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

    if (type === 'sqrt' || type === 'cbrt') {
      const contentField = element.querySelector('.sqrt-content, .cbrt-content');
      if (contentField) {
        updateRootContentClasses(contentField);
      }
    }
  });

  if (type === 'trig' && content.name) {
    const trigName = element.querySelector('.trig-name');
    let display = content.name;
    if (content.isHyperbolic) display += 'h';
    if (content.isInverse) display += '<sup>-1</sup>';
    trigName.innerHTML = display;
  }

  setupMathElementEvents(type, fields);
  return element;
};

const updateRootSizes = (parentElement) => {
  let nestingLevel = getRootNesting(parentElement);
  const parentRoots = [];
  let currentParent = parentElement;
  while (currentParent) {
    currentParent = getParentRoot(currentParent);
    if (currentParent) {
      parentRoots.push(currentParent);
    }
  }
  let rootWidth = 12;
  let rootHeight = 20;
  parentRoots.forEach(parentRoot => {
    const img = parentRoot.querySelector('img');
    if (img) {
      img.style.width = `${rootWidth}px`;
      img.style.height = `${rootHeight}px`;
      rootWidth += 2;
      rootHeight += 4;
      if (nestingLevel >= 6) rootWidth += 1;
    }
  });
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
    const range2 = document.createRange();
    range2.setStartAfter(element);
    range2.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range2);
  } else {
    inputField.appendChild(element);
    const range = document.createRange();
    range.setStartAfter(element);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  if (type === 'sqrt' || type === 'cbrt') {
    const contentField = element.querySelector('.sqrt-content, .cbrt-content');
    updateRootContentClasses(contentField);
    let nestingLevel = getRootNesting(element);
    if (nestingLevel >= 1) {
        const parentRoots = [];
        let currentParent = element;
        while (currentParent) {
            currentParent = getParentRoot(currentParent);
            if (currentParent) {
                parentRoots.push(currentParent);
            }
        }
        let rootTop = -4;
        let rootLeft = 0;
        if (nestingLevel > 3) {
          rootLeft = -1.2;
        }
        let rootWidth = 14;
        let rootHeight = 24;
        parentRoots.forEach(parentRoot => {
            console.log(rootWidth, rootHeight, parentRoot)
            const content = type === 'sqrt' 
            ? parentRoot.querySelector('.sqrt-content')
            : parentRoot.querySelector('.cbrt-content');
            const img = parentRoot.querySelector('img');
            img.style.width = `${rootWidth}px`;
            img.style.height = `${rootHeight}px`;
            content.style.setProperty('--before-left', `${rootLeft}px`);
            content.style.setProperty('--before-top', `${rootTop}px`);
            rootLeft -= 0.1;
            if (nestingLevel >= 6) rootWidth +=1;
            rootWidth += 2;
            rootHeight += 4;
            updateRootContentClasses(content); 
        });
    }
    let currentParent = element;
    while (currentParent) {
        currentParent = getParentRoot(currentParent);
        if (currentParent) {
          const contentField = currentParent.querySelector('.sqrt-content, .cbrt-content');
          if (contentField) {
            updateRootContentClasses(contentField);
          }
        }
    }
  } 

  if (type === 'power') {
    let currentParent = element;
    while (currentParent && currentParent !== inputField) {
      if (currentParent.classList.contains('sqrt-content') || currentParent.classList.contains('cbrt-content')) {
        updateRootContentClasses(currentParent);
      }
      currentParent = currentParent.parentNode;
    }
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
export const insertTrig = (name, isInverse = false, isHyperbolic = false) => {
  if (name === 'pi' || name === 'degree' || name === 'rad') {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      if (inputField.contains(startContainer)) {
        range.deleteContents();
        const symbol = name === 'pi' ? 'π' : name === 'degree' ? '°' : 'rad';
        const textNode = document.createTextNode(symbol);
        range.insertNode(textNode);

        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        const editableParent = startContainer.nodeType === Node.TEXT_NODE
          ? startContainer.parentElement.closest('[contenteditable="true"]')
          : startContainer.closest('[contenteditable="true"]');
        const focusElement = editableParent || inputField;
        focusElement.focus();
      } else {
        inputField.focus();
        const textNode = document.createTextNode(name === 'pi' ? 'π' : name === 'degree' ? '°' : 'rad');
        inputField.appendChild(textNode);
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    updatePlaceholderVisibility();
    return;
  }

  insertMathElement("trig", { name, isInverse, isHyperbolic });
};

const setupMathElementEvents = (type, fields) => {
  const config = ELEMENT_CONFIG[type];
  const element = fields[config.editableFields[0]].closest(`.${type}`);

  const handleBackspace = (field, e) => {
    if (e.key === 'Backspace' && field.textContent.trim() === '') {
      e.preventDefault();
      e.stopPropagation();
        if (field.classList.contains('trig-content')) {
        const trigFunc = field.closest('.trig-func');
        if (trigFunc) {
          inputField.querySelectorAll('.trig-func').forEach(el => {
            el.classList.remove('selected');
            el.dataset.selected = 'false';
          });
          trigFunc.classList.add('selected');
          trigFunc.dataset.selected = 'true';
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNode(trigFunc);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
      }
  
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
  
        let currentParent = element.parentNode;
        while (currentParent && currentParent !== inputField) {
            if (currentParent.classList.contains('sqrt-content') || currentParent.classList.contains('cbrt-content')) {
                updateRootContentClasses(currentParent);
            }
            currentParent = currentParent.parentNode;
        }
  
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(targetTextNode, targetTextNode.textContent.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (element && element.dataset.selected === 'true') {
        const parent = element.parentNode;
        const nextSibling = element.nextSibling;
        const isRoot = element.classList.contains('sqrt') || element.classList.contains('cbrt');
        element.remove();
  
        let currentParent = parent;
        while (currentParent && currentParent !== inputField) {
            if (currentParent.classList.contains('sqrt-content') || currentParent.classList.contains('cbrt-content')) {
                updateRootContentClasses(currentParent);
            }
            currentParent = currentParent.parentNode;
        }
  
        if (isRoot) {
          updateRootSizes(parent);
        }
  
        const selection = window.getSelection();
        const range = document.createRange();
        let targetParent = parent;
        while (targetParent && targetParent !== inputField) {
          if (targetParent.classList.contains('sqrt-content') || targetParent.classList.contains('cbrt-content')) {
            range.setStart(targetParent, targetParent.childNodes.length);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            break;
          }
          targetParent = targetParent.parentNode;
        }
        if (!range.startContainer) {
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
        }
      } else if (element) {
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
    if (element) {
      element.classList.remove('selected');
      element.dataset.selected = 'false';
    }
  };

  const handleInputFieldClick = (e) => {
    const selectedElements = inputField.querySelectorAll('.fraction.selected, .power.selected, .sqrt.selected, .cbrt.selected, .trig-func.selected');
    selectedElements.forEach(el => {
      if (el !== element) {
        el.classList.remove('selected');
        el.dataset.selected = 'false';
      }
    });
  };

  inputField.addEventListener('click', handleInputFieldClick);

  config.editableFields.forEach((fieldName, index) => {
    const field = fields[fieldName];
    if ((type === 'sqrt' && fieldName === 'sqrt-content') || (type === 'cbrt' && fieldName === 'cbrt-content')) {
      updateRootContentClasses(field);
      field.addEventListener('input', () => updateRootContentClasses(field));
    }
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
      const textAfterCursor = fullText.substring(startOffset);
      const numberAfterRegex = textAfterCursor.match(/^\d+/);
      if (numberAfterRegex) {
        numeratorText = numberAfterRegex[0];
        textToPreserve = textBeforeCursor;
      } else {
        const operators = ['+', '-', '*', '/'];
        let lastOperatorIndex = -1;

        for (const op of operators) {
          const index = textBeforeCursor.lastIndexOf(op);
          if (index > lastOperatorIndex) {
            lastOperatorIndex = index;
          }
        }

        if (lastOperatorIndex !== -1 && lastOperatorIndex === textBeforeCursor.length - 1) {
          numeratorText = '';
          textToPreserve = textBeforeCursor;
        } else {
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
          } else if (lastOperatorIndex !== -1) {
            numeratorText = textBeforeCursor.substring(lastOperatorIndex + 1);
            textToPreserve = textBeforeCursor.substring(0, lastOperatorIndex + 1);
          } else {
            numeratorText = textBeforeCursor;
            textToPreserve = '';
          }
        }
      }

      rawStartContainer.textContent = '';

      if (textToPreserve) {
        const preservedTextNode = document.createTextNode(textToPreserve);
        rawStartContainer.parentNode.insertBefore(preservedTextNode, rawStartContainer);
      }

      const fractionElement = createMathElement("fraction", { first: numeratorText.trim() });
      rawStartContainer.parentNode.insertBefore(fractionElement, rawStartContainer);

      if (textAfterCursor) {
        let textToInsert = textAfterCursor;
        if (numberAfterRegex) {
          textToInsert = textAfterCursor.substring(numberAfterRegex[0].length);
        }
        if (textToInsert) {
          const afterCursorNode = document.createTextNode(textToInsert);
          rawStartContainer.parentNode.insertBefore(afterCursorNode, rawStartContainer);
        }
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