import { querySpan, outputSpan, errorContainer, resultContainer, inputField, placeholder } from "./constants.js";
import { Complex, evaluateComplexExpression } from "./complex.js";
import { show, hide, formatNumber } from "./utils.js";
import { addGlobalEventListeners } from "./globalEventLisneters.js";
import { parseExpression } from "./math/parseExpression.js";
import { TrigParser } from "./math/trigParser.js";
import { Rational, evaluateRationalExpression } from "./rational.js";

addGlobalEventListeners();
inputField.focus();
const trigParser = new TrigParser();

function replaceMathFunctions(expression) {
  let result = expression;
  let startIndex = 0;

  while (startIndex < result.length) {
    let sqrtIndex = result.indexOf('sqrt(', startIndex);
    let cbrtIndex = result.indexOf('cbrt(', startIndex);

    let funcIndex = -1;
    let funcName = '';
    if (sqrtIndex !== -1 && (cbrtIndex === -1 || sqrtIndex < cbrtIndex)) {
      funcIndex = sqrtIndex;
      funcName = 'sqrt';
    } else if (cbrtIndex !== -1) {
      funcIndex = cbrtIndex;
      funcName = 'cbrt';
    }

    if (funcIndex === -1) {
      break;
    }

    let openParens = 1;
    let contentStart = funcIndex + funcName.length + 1;
    let contentEnd = contentStart;

    while (contentEnd < result.length && openParens > 0) {
      if (result[contentEnd] === '(') openParens++;
      if (result[contentEnd] === ')') openParens--;
      contentEnd++;
    }

    if (openParens !== 0) {
      throw new Error("Несбалансированные скобки в выражении");
    }

    let innerContent = result.substring(contentStart, contentEnd - 1);
    let replacedInner = replaceMathFunctions(innerContent);
    let replacement = funcName === 'sqrt' ? `Math.sqrt(${replacedInner})` : `Math.cbrt(${replacedInner})`;

    result = result.substring(0, funcIndex) + replacement + result.substring(contentEnd);
    startIndex = funcIndex + replacement.length;
  }

  return result;
}

function isPurelyRational(expr) {
  if (expr.includes('i') || 
      expr.includes('sqrt') || 
      expr.includes('cbrt') || 
      expr.includes('Math.') ||
      expr.includes('sin') || expr.includes('cos') || expr.includes('tan') ||
      expr.includes('sec') || expr.includes('csc') || expr.includes('cot') ||
      expr.includes('π') || expr.includes('∞')) {
    return false;
  }
  return true; 
}

export function solve() {
  try {
    hide(errorContainer);
    const hasCustomElements = inputField.querySelectorAll('.fraction, .power, .sqrt, .cbrt').length > 0;
    let expression = hasCustomElements ? parseExpression() : inputField.textContent.trim();

    const isComplex = /(?<![a-zA-Z])[i](?![a-zA-Z])/.test(expression);
    let result;

    if (isComplex) {
      result = evaluateComplexExpression(expression);
    } else if (isPurelyRational(expression)) {
      try {
        result = evaluateRationalExpression(expression);
      } catch (rationalError) {
        let evalExpression = expression
          .replace(/π/g, 'Math.PI')
          .replace(/∞/g, 'Infinity');
        evalExpression = trigParser.parseExpression(evalExpression);
        evalExpression = replaceMathFunctions(evalExpression);
        result = eval(evalExpression);
        if (result === Infinity || result === -Infinity) {
          result = result === Infinity ? "∞" : "-∞";
        } else if (isNaN(result) || !isFinite(result)) {
          throw new Error("Неверный результат после попытки рационального вычисления");
        }
      }
    } else {
      let evalExpression = expression
        .replace(/π/g, 'Math.PI')
        .replace(/∞/g, 'Infinity');

      evalExpression = trigParser.parseExpression(evalExpression);
      evalExpression = replaceMathFunctions(evalExpression);

      result = eval(evalExpression);
      if (result === Infinity || result === -Infinity) {
        result = result === Infinity ? "∞" : "-∞";
      } else if (isNaN(result) || !isFinite(result)) {
        throw new Error("Неверный результат");
      }
    }
    const queryString = hasCustomElements
      ? parseExpression(true)
      : inputField.textContent;
    querySpan.textContent = queryString.replace(/\*\*/g, '^');

    if (result instanceof Complex) {
      outputSpan.textContent = result.toString();
    } else if (result instanceof Rational) {
      outputSpan.textContent = result.toString();
    } else if (typeof result === 'number') {
      outputSpan.textContent = formatNumber(result);
    } else {
      outputSpan.textContent = result;
    }
    show(resultContainer);
  } catch (error) {
    errorContainer.textContent = error.message;
    show(errorContainer);
    hide(resultContainer);
  }
}