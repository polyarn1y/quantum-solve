import { inputField } from "../constants.js";

const handleInputFieldBackspace = (e) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    const selectedElements = inputField.querySelectorAll('.fraction.selected, .power.selected, .sqrt.selected, .cbrt.selected, .trig-func.selected');
    selectedElements.forEach(el => {
      el.classList.remove('selected');
      el.dataset.selected = 'false';
    });
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;
        
        if (startContainer.nodeType === Node.TEXT_NODE) {
          const trigContent = startContainer.parentElement;
          if (trigContent && trigContent.classList.contains('trig-content')) {
            if (e.key === 'ArrowLeft' && range.startOffset === 0) {
              e.preventDefault();
              const prevNode = trigContent.previousElementSibling;
              if (prevNode) {
                const newRange = document.createRange();
                newRange.selectNodeContents(prevNode);
                newRange.collapse(false);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            } else if (e.key === 'ArrowRight' && range.startOffset === startContainer.textContent.length) {
              e.preventDefault();
              const nextNode = trigContent.nextElementSibling;
              if (nextNode) {
                const newRange = document.createRange();
                newRange.selectNodeContents(nextNode);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            }
          }
        }
      }
    }
    return;
  }

  if (e.key === 'Backspace') {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      const startOffset = range.startOffset;

      const selectedElements = inputField.querySelectorAll('.fraction.selected, .power.selected, .sqrt.selected, .cbrt.selected, .trig-func.selected');
      if (selectedElements.length > 0) {
        e.preventDefault();
        selectedElements.forEach(el => {
          const parent = el.parentNode;
          const nextSibling = el.nextSibling;
          el.remove();
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
        });
        return;
      }

      if (
        startContainer.nodeType === Node.TEXT_NODE &&
        startContainer.parentElement &&
        startContainer.parentElement.classList.contains('trig-content') &&
        startContainer.textContent.trim() === ''
      ) {
        e.preventDefault();
        const trigFunc = startContainer.closest('.trig-func');
        if (trigFunc) {
          inputField.querySelectorAll('.trig-func').forEach(el => {
            el.classList.remove('selected');
            el.dataset.selected = 'false';
          });
          trigFunc.classList.add('selected');
          trigFunc.dataset.selected = 'true';
          const newRange = document.createRange();
          newRange.selectNode(trigFunc);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        return;
      }

      if (startContainer === inputField && startOffset > 0) {
        const nodes = Array.from(inputField.childNodes);
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

      if (startContainer === inputField) {
        const nodes = Array.from(inputField.childNodes);
        let prevElement = null;
        for (let i = startOffset - 1; i >= 0; i--) {
          if (nodes[i] && nodes[i].classList) {
            if (nodes[i].classList.contains('fraction')) {
              prevElement = { type: 'fraction', node: nodes[i] };
              break;
            } else if (nodes[i].classList.contains('power')) {
              prevElement = { type: 'power', node: nodes[i] };
              break;
            } else if (nodes[i].classList.contains('sqrt')) {
              prevElement = { type: 'sqrt', node: nodes[i] };
              break;
            } else if (nodes[i].classList.contains('cbrt')) {
              prevElement = { type: 'cbrt', node: nodes[i] };
              break;
            } else if (nodes[i].classList.contains('trig-func')) {
              prevElement = { type: 'trig-func', node: nodes[i] };
              break;
            }
          }
        }

        if (prevElement) {
          e.preventDefault();
          const { type, node } = prevElement;
          let contentField;
          let contentText = '';

          if (type === 'fraction') {
            const numerator = node.querySelector('.numerator');
            const denominator = node.querySelector('.denominator');
            contentField = denominator;
            contentText = (numerator.textContent.trim() || denominator.textContent.trim());
          } else if (type === 'power') {
            const base = node.querySelector('.base');
            const exponent = node.querySelector('.exponent');
            contentField = exponent;
            contentText = (base.textContent.trim() || exponent.textContent.trim());
          } else if (type === 'sqrt') {
            contentField = node.querySelector('.sqrt-content');
            contentText = contentField.textContent.trim();
          } else if (type === 'cbrt') {
            contentField = node.querySelector('.cbrt-content');
            contentText = contentField.textContent.trim();
          } else if (type === 'trig-func') {
            contentField = node.querySelector('.trig-content');
            contentText = contentField.textContent.trim();
          }

          if (contentText) {
            moveFocus(contentField, 'end');
          } else {
            inputField.querySelectorAll('.fraction, .power, .sqrt, .cbrt, .trig-func').forEach(el => {
              el.classList.remove('selected');
              el.dataset.selected = 'false';
            });
            node.classList.add('selected');
            node.dataset.selected = 'true';
            const newRange = document.createRange();
            newRange.selectNode(node);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
          return;
        }
      }
    }
  }
};

inputField.addEventListener('keydown', handleInputFieldBackspace);

export const getSelection = () => {
  const selection = window.getSelection();
  return {
    selection: selection.rangeCount > 0 ? selection : null,
    range: selection.rangeCount > 0 ? selection.getRangeAt(0) : null
  };
};

export const isAtEnd = (range, element) =>
  range.endContainer === element
    ? range.endOffset === element.childNodes.length
    : range.endContainer.nodeType === Node.TEXT_NODE
      && range.endOffset === range.endContainer.textContent.length
      && !range.endContainer.nextSibling;

export const isAtStart = (range, element) =>
  range.startContainer === element
    ? range.startOffset === 0
    : range.startContainer.nodeType === Node.TEXT_NODE
      && range.startOffset === 0
      && !range.startContainer.previousSibling;

export const moveFocus = (target, position) => {
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