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

const helpButton = document.querySelector('.help-button');
const helpModal = document.getElementById('helpModal');
const closeButton = document.querySelector('.close-button');

helpButton.addEventListener('click', (event) => {
  event.preventDefault(); 
  helpModal.classList.add('active');
});

closeButton.addEventListener('click', () => {
  helpModal.classList.remove('active');
});

window.addEventListener('click', (event) => {
  if (event.target == helpModal) {
    helpModal.classList.remove('active');
  }
});

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
      expr.includes('π') || expr.includes('∞') ||
      expr.includes('**')) {
    return false;
  }
  return true; 
}

function handleLargeExponent(expression) {
  const patternWithParens = /^\s*\(\s*([+-]?\d*\.?\d+(?:e[+-]?\d+)?)\s*\*\*\s*(\d+)\s*\)\s*$/;
  const patternWithoutParens = /^\s*([+-]?\d*\.?\d+(?:e[+-]?\d+)?)\s*\*\*\s*(\d+)\s*$/;

  let match = expression.match(patternWithParens);
  let baseStr, exponentStr;

  if (match) {
    baseStr = match[1];
    exponentStr = match[2];
  } else {
    match = expression.match(patternWithoutParens);
    if (match) {
      baseStr = match[1];
      exponentStr = match[2];
    }
  }

  if (baseStr && exponentStr) {
    const base = parseFloat(baseStr);
    const exponent = parseInt(exponentStr, 10);

    if (base > 0 && exponent >= 1000) {
      try {
        const log10Base = Math.log10(base);
        const totalLog = exponent * log10Base;

        if (!isFinite(totalLog)) {
            return "Переполнение при вычислении log"; // Отличимое сообщение
        }

        const expOrder = Math.floor(totalLog);
        const mantissaLog = totalLog - expOrder;
        let mantissa = Math.pow(10, mantissaLog);
        mantissa = parseFloat(mantissa.toPrecision(15)); // Ограничиваем точность мантиссы

        return `${mantissa}e+${expOrder}`;
      } catch (e) {
        return null; // Ошибка при вычислении логарифма, возврат к eval
      }
    }
  }
  return null; // Не соответствует паттерну или условиям (маленький показатель, неположительное основание)
}

export function solve() {
  try {
    hide(errorContainer);
    const hasCustomElements = inputField.querySelectorAll('.fraction, .power, .sqrt, .cbrt').length > 0;
    let expression = hasCustomElements ? parseExpression() : inputField.textContent.trim();

    const isComplex = /(?<![a-zA-Z])[i](?![a-zA-Z])/.test(expression);
    let result;

    if (isComplex) {
      result = evaluateComplexExpression(expression.replace(/\^/g, '**'));
    } else if (isPurelyRational(expression)) {
      try {
        result = evaluateRationalExpression(expression.replace(/\^/g, '**'));
      } catch (rationalError) {
        let evalExpression = expression
          .replace(/π/g, 'Math.PI')
          .replace(/∞/g, 'Infinity')
          .replace(/\^/g, '**');
        evalExpression = trigParser.parseExpression(evalExpression);
        evalExpression = replaceMathFunctions(evalExpression);
        result = eval(evalExpression);
        if (typeof result === 'number' && (result === Infinity || result === -Infinity)) {
          result = result === Infinity ? "∞" : "-∞";
        } else if (typeof result === 'number' && (isNaN(result) || !isFinite(result))) {
          throw new Error("Неверный результат после попытки рационального вычисления");
        }
      }
    } else {
      let evalExpression = expression
        .replace(/π/g, 'Math.PI')
        .replace(/∞/g, 'Infinity')
        .replace(/\^/g, '**');

      let largeExponentHandled = false;
      const largeExpStr = handleLargeExponent(evalExpression);

      if (largeExpStr !== null) {
        result = largeExpStr; 
        largeExponentHandled = true;
      } else {
        let exprForEval = evalExpression;
        exprForEval = trigParser.parseExpression(exprForEval);
        exprForEval = replaceMathFunctions(exprForEval);
        result = eval(exprForEval);
      }

      if (!largeExponentHandled) {
        if (typeof result === 'number') {
          if (result === Infinity || result === -Infinity) {
            result = result === Infinity ? "∞" : "-∞";
          } else if (isNaN(result) || !isFinite(result)) {
            throw new Error("Неверный числовой результат от eval");
          }
        } else {
           throw new Error("Результат eval не является числом");
        }
      }
    }

    const queryString = hasCustomElements
      ? parseExpression(true)
      : inputField.textContent.trim();
    querySpan.textContent = queryString;

    if (result instanceof Complex) {
      outputSpan.textContent = result.toString();
    } else if (result instanceof Rational) {
      outputSpan.textContent = result.toString();
    } else if (typeof result === 'number') {
      outputSpan.textContent = formatNumber(result);
    } else if (typeof result === 'string') { 
      outputSpan.textContent = result;
    } else {
      outputSpan.textContent = String(result); 
    }
    show(resultContainer);
  } catch (error) {
    errorContainer.textContent = "Калькулятор не понимает вашего запроса ☹️";
    show(errorContainer);
    hide(resultContainer);
  }
}