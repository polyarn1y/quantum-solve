import { querySpan, outputSpan, errorContainer, resultContainer, inputField, placeholder } from "./constants.js";
import { Complex, parseComplex } from "./complex.js";
import { show, hide } from "./domUtils.js";
import { addGlobalEventListeners } from "./globalEventLisneters.js";

addGlobalEventListeners();
export function solve(expression) {
  try {
    hide(errorContainer);
    const formattedExpression = formatQueryString(inputField);
    const isComplex = /[i]/.test(formattedExpression);

    let result;
    if (isComplex) {
      result = parseComplex(formattedExpression);
    } else {
      let evalExpression = formattedExpression
        .replace(/π/g, 'Math.PI')
        .replace(/∞/g, 'Infinity')
        .replace(/sin\(([^)]+)\)/g, "Math.sin($1)")
        .replace(/cos\(([^)]+)\)/g, "Math.cos($1)")
        .replace(/tan\(([^)]+)\)/g, "Math.tan($1)")
        .replace(/exp\(([^)]+)\)/g, "Math.exp($1)")
        .replace(/log\(([^)]+)\)/g, "Math.log($1)")
        .replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)")
        .replace(/\^/g, '**');

      result = eval(evalExpression);
      if (result === Infinity || result === -Infinity) {
        result = (result === Infinity) ? "∞" : "-∞";
      } else if (isNaN(result) || !isFinite(result)) {
        throw new Error("Invalid result");
      }
    }

    const queryString = formattedExpression.replace(/\*/g, '×');
    querySpan.textContent = queryString;
    outputSpan.textContent = result instanceof Complex ? result.toString() : result;

    show(resultContainer);
  } catch (error) {
    show(errorContainer);
    hide(resultContainer);
  }
}

function formatQueryString(inputField) {
  const nodes = Array.from(inputField.childNodes);
  let result = '';
  let lastWasFraction = false;
  let mathElementCount = 0;
  let hasOtherContent = false;
  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        hasOtherContent = true;
      }
    } else if (node.classList?.contains('fraction') || node.classList?.contains('power')) {
      mathElementCount++;
    }
  });
  nodes.forEach((node, index) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        if (lastWasFraction) {
          result += '*';
        }
        result += text;
        lastWasFraction = false;
      }
    } else if (node.classList?.contains('fraction')) {
      if (lastWasFraction) {
        result += '*';
      }
      const numerator = node.querySelector('.numerator')?.textContent.trim() || '';
      const denominator = node.querySelector('.denominator')?.textContent.trim() || '';
      if (!numerator || !denominator) {
        throw new Error("Числитель или знаменатель пусты");
      }
      if (mathElementCount === 1 && !hasOtherContent) {
        result += `${numerator}/${denominator}`;
      } else {
        result += `(${numerator}/${denominator})`;
      }
      lastWasFraction = true;
    } else if (node.classList?.contains('power')) {
      if (lastWasFraction) {
        result += '*';
      }
      const base = node.querySelector('.base')?.textContent.trim() || '';
      const exponent = node.querySelector('.exponent')?.textContent.trim() || '';
      if (!base || !exponent) {
        throw new Error("Основание или показатель степени пусты");
      }
      if (mathElementCount === 1 && !hasOtherContent) {
        result += `${base}^${exponent}`;
      } else {
        result += `(${base}^${exponent})`;
      }
      lastWasFraction = false;
    }
  });
 
  result = result || inputField.textContent.trim();
  while (result.includes('--')) {
    result = result.replace('--', '+');
  }

  return result || inputField.textContent.trim();
}