import { inputField } from "../constants.js";

const handleInputFieldBackspace = (e) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    const selectedFraction = inputField.querySelector('.fraction.selected');
    const selectedPower = inputField.querySelector('.power.selected');
    const selectedSqrt = inputField.querySelector('.sqrt.selected');
    const selectedCbrt = inputField.querySelector('.cbrt.selected');
    if (selectedFraction) {
      selectedFraction.classList.remove('selected');
      selectedFraction.dataset.selected = 'false';
    }
    if (selectedPower) {
      selectedPower.classList.remove('selected');
      selectedPower.dataset.selected = 'false';
    }
    if (selectedSqrt) {
      selectedSqrt.classList.remove('selected');
      selectedSqrt.dataset.selected = 'false';
    }
    if (selectedCbrt) {
      selectedCbrt.classList.remove('selected');
      selectedCbrt.dataset.selected = 'false';
    }
    return;
  }

  if (e.key === 'Backspace') {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      const startOffset = range.startOffset;

      const selectedFraction = inputField.querySelector('.fraction.selected');
      const selectedPower = inputField.querySelector('.power.selected');
      const selectedSqrt = inputField.querySelector('.sqrt.selected');
      const selectedCbrt = inputField.querySelector('.cbrt.selected');
      
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
      if (selectedPower) {
        e.preventDefault();
        const parent = selectedPower.parentNode;
        const nextSibling = selectedPower.nextSibling;
        selectedPower.remove();
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
      if (selectedSqrt) {
        e.preventDefault();
        const parent = selectedSqrt.parentNode;
        const nextSibling = selectedSqrt.nextSibling;
        selectedSqrt.remove();
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
      if (selectedCbrt) {
        e.preventDefault();
        const parent = selectedCbrt.parentNode;
        const nextSibling = selectedCbrt.nextSibling;
        selectedCbrt.remove();
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

      let prevPower = null;
      let prevFraction = null;
      let prevSqrt = null;
      let prevCbrt = null;
      if (startContainer === inputField) {
        const nodes = Array.from(inputField.childNodes);
        for (let i = startOffset - 1; i >= 0; i--) {
          if (nodes[i] && nodes[i].classList && nodes[i].classList.contains('power')) {
            prevPower = nodes[i];
            break;
          } else if (nodes[i] && nodes[i].classList && nodes[i].classList.contains('fraction')) {
            prevFraction = nodes[i];
            break;
          } else if (nodes[i] && nodes[i].classList && nodes[i].classList.contains('sqrt')) {
            prevSqrt = nodes[i];
            break;
          } else if (nodes[i] && nodes[i].classList && nodes[i].classList.contains('cbrt')) {
            prevCbrt = nodes[i];
            break;
          }
        }
      }

      if (prevPower) {
        e.preventDefault();
        const base = prevPower.querySelector('.base');
        const exponent = prevPower.querySelector('.exponent');
        const baseContent = base.textContent.trim();
        const exponentContent = exponent.textContent.trim();

        if (baseContent || exponentContent) {
          moveFocus(exponent, 'end');
        } else {
          const allPowers = inputField.querySelectorAll('.power');
          allPowers.forEach(p => {
            p.classList.remove('selected');
            p.dataset.selected = 'false';
          });
          prevPower.classList.add('selected');
          prevPower.dataset.selected = 'true';
          const newRange = document.createRange();
          newRange.selectNode(prevPower);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        return;
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

      if (prevSqrt) {
        e.preventDefault();
        const content = prevSqrt.querySelector('.sqrt-content');
        const contentText = content.textContent.trim();

        if (contentText) {
          moveFocus(content, 'end');
        } else {
          const allSqrt = inputField.querySelectorAll('.sqrt');
          allSqrt.forEach(s => {
            s.classList.remove('selected');
            s.dataset.selected = 'false';
          });
          prevSqrt.classList.add('selected');
          prevSqrt.dataset.selected = 'true';
          const newRange = document.createRange();
          newRange.selectNode(prevSqrt);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        return;
      }

      if (prevCbrt) {
        e.preventDefault();
        const content = prevCbrt.querySelector('.cbrt-content');
        const contentText = content.textContent.trim();

        if (contentText) {
          moveFocus(content, 'end');
        } else {
          const allCbrt = inputField.querySelectorAll('.cbrt');
          allCbrt.forEach(s => {
            s.classList.remove('selected');
            s.dataset.selected = 'false';
          });
          prevCbrt.classList.add('selected');
          prevCbrt.dataset.selected = 'true';
          const newRange = document.createRange();
          newRange.selectNode(prevCbrt);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        return;
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