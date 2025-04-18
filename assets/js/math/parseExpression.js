import { inputField } from "../constants.js";

function parseNode(node, forDisplay = false, isNested = false) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.classList.contains('fraction')) {
      const numerator = node.querySelector('.numerator');
      const denominator = node.querySelector('.denominator');
      const numeratorContent = parseNode(numerator, forDisplay, true).trim();
      const denominatorContent = parseNode(denominator, forDisplay, true).trim();

      if (numeratorContent && denominatorContent) {
        const hasOperators = (str) => /[+\-*^]/.test(str);
        const needsParens = (str) => hasOperators(str) || str.includes('/');

        const formattedNumerator = needsParens(numeratorContent) ? `(${numeratorContent})` : numeratorContent;
        const formattedDenominator = needsParens(denominatorContent) ? `(${denominatorContent})` : denominatorContent;

        const fractionPart = `${formattedNumerator}/${formattedDenominator}`;
        return isNested ? fractionPart : `(${fractionPart})`;
      } else {
        throw new Error('Числитель или знаменатель дроби пустой');
      }
    } else if (node.classList.contains('power')) {
      const base = node.querySelector('.base');
      const exponent = node.querySelector('.exponent');
      const baseContent = parseNode(base, forDisplay, true).trim();
      const exponentContent = parseNode(exponent, forDisplay, true).trim();

      if (baseContent && exponentContent) {
        const hasOperators = (str) => /[+\-*/]/.test(str);
        const formattedBase = baseContent.includes('/') ? `(${baseContent})` : (hasOperators(baseContent) && !baseContent.includes('/') ? `(${baseContent})` : baseContent);
        const formattedExponent = hasOperators(exponentContent) ? `(${exponentContent})` : exponentContent;
        const powerPart = `${formattedBase}^${formattedExponent}`;
        return forDisplay ? `(${powerPart})` : `(${powerPart})`;
      } else {
        throw new Error('Основание или показатель степени пустой');
      }
    } else if (node.classList.contains('sqrt')) {
      const content = node.querySelector('.sqrt-content');
      const contentText = parseNode(content, forDisplay, true).trim();

      if (contentText) {
        const hasOperators = (str) => /[+\-*/]/.test(str);
        const formattedContent = hasOperators(contentText) ? `(${contentText})` : contentText;
        return forDisplay ? `√${formattedContent}` : `sqrt(${formattedContent})`;
      } else {
        throw new Error('Содержимое квадратного корня пустое');
      }
    } else if (node.classList.contains('cbrt')) {
      const content = node.querySelector('.cbrt-content');
      const contentText = parseNode(content, forDisplay, true).trim();

      if (contentText) {
        const hasOperators = (str) => /[+\-*/]/.test(str);
        const formattedContent = hasOperators(contentText) || contentText.includes('^') || contentText.includes('/') ? `(${contentText})` : contentText;
        const cbrtPart = forDisplay ? `∛${formattedContent}` : `cbrt(${formattedContent})`;
        const result = isNested ? cbrtPart : `(${cbrtPart})`;
        return result;
      } else {
        throw new Error('Содержимое кубического корня пустое');
      }
    }
  }

  let result = '';
  node.childNodes.forEach(child => {
    result += parseNode(child, forDisplay, isNested);
  });
  return result;
}

export function parseExpression(forDisplay = false) {
  let expression = '';
  const nodes = inputField.childNodes;

  nodes.forEach((node) => {
    expression += parseNode(node, forDisplay);
  });

  return expression.trim();
}