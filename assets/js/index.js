import { querySpan, outputSpan, errorContainer, resultContainer, inputField, placeholder } from "./constants.js";
import { Complex, parseComplex } from "./complex.js";
import { show, hide } from "./domUtils.js";
import { addGlobalEventListeners } from "./globalEventLisneters.js";

addGlobalEventListeners();
export function solve(expression) {
  try {
    hide(errorContainer);
    const processedResult = processMathElements(inputField, expression);

    const isComplex = /[i]/.test(expression) || processedResult.isComplex;
    let result;

    if (isComplex) {
      result = parseComplex(processedResult.expression);
    } else {
      let evalExpression = processedResult.expression
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
    const queryString = formatQueryString(inputField).replace(/\*/g, '×');
    querySpan.textContent = queryString;
    outputSpan.textContent = result instanceof Complex ? result.toString() : result;

    show(resultContainer);
  } catch (error) {
    show(errorContainer);
    hide(resultContainer);
  }
}

function processMathElements(inputField, originalExpression) {
  const fractionElements = inputField.querySelectorAll('.fraction');
  const powerElements = inputField.querySelectorAll('.power');
  let expression = originalExpression;
  let isComplex = false;

  if (fractionElements.length > 0) {
    fractionElements.forEach(fraction => {
      const numerator = fraction.querySelector('.numerator').textContent.trim();
      const denominator = fraction.querySelector('.denominator').textContent.trim();
      if (!numerator || !denominator) {
        throw new Error("Числитель или знаменатель пусты");
      }
      if (parseFloat(denominator) === 0) {
        throw new Error("Деление на ноль");
      }
      if (/[i]/.test(numerator) || /[i]/.test(denominator)) {
        isComplex = true;
        expression = expression.replace(fraction.textContent.trim(), `(${numerator}/${denominator})`);
      } else {
        const numValue = parseFloat(numerator);
        const denomValue = parseFloat(denominator);
        const fractionValue = numValue / denomValue;
        if (fractionElements.length === 1 && powerElements.length === 0 && inputField.textContent.trim() === fraction.textContent.trim()) {
          expression = fractionValue.toString();
        } else {
          expression = expression.replace(fraction.textContent.trim(), fractionValue.toString());
        }
      }
    });
  }
  if (powerElements.length > 0) {
    powerElements.forEach(power => {
      const base = power.querySelector('.base').textContent.trim();
      const exponent = power.querySelector('.exponent').textContent.trim();

      if (!base || !exponent) {
        throw new Error("Основание или показатель степени пусты");
      }

      if (/[i]/.test(base) || /[i]/.test(exponent)) {
        isComplex = true;
        expression = expression.replace(power.textContent.trim(), `(${base}^${exponent})`);
      } else {
        const baseValue = parseFloat(base);
        const exponentValue = parseFloat(exponent);
        if (isNaN(baseValue) || isNaN(exponentValue)) {
          throw new Error("Недопустимые значения основания или показателя");
        }
        if (baseValue === 0 && exponentValue <= 0) {
          throw new Error("Недопустимая степень: 0 в отрицательной или нулевой степени");
        }

        const powerValue = Math.pow(baseValue, exponentValue);
        if (powerElements.length === 1 && fractionElements.length === 0 && inputField.textContent.trim() === power.textContent.trim()) {
          expression = powerValue.toString();
        } else {
          expression = expression.replace(power.textContent.trim(), powerValue.toString());
        }
      }
    });
  }
  return { expression, isComplex };
}

function formatQueryString(inputField) {
  let queryString = '';
  const nodes = inputField.childNodes;
  let previousNodeWasMathElement = false;
  let previousContent = '';

  nodes.forEach((node, index) => {
    let currentContent = '';

    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList.contains('fraction')) {
        const numerator = node.querySelector('.numerator').textContent.trim();
        const denominator = node.querySelector('.denominator').textContent.trim();
        if (numerator && denominator) {
          currentContent = `${numerator}/${denominator}`;
        } else {
          currentContent = node.textContent.trim();
        }
      } else if (node.classList.contains('power')) {
        const base = node.querySelector('.base').textContent.trim();
        const exponent = node.querySelector('.exponent').textContent.trim();
        if (base && exponent) {
          currentContent = `${base}^${exponent}`;
        } else {
          currentContent = node.textContent.trim();
        }
      } else {
        currentContent = node.textContent.trim();
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      currentContent = node.textContent;
    }

    if (currentContent) {
      const isMathElement = node.nodeType === Node.ELEMENT_NODE && (node.classList.contains('fraction') || node.classList.contains('power'));
      const isNumberOrSymbol = node.nodeType === Node.TEXT_NODE && /^[0-9π∞]/.test(currentContent.trim());
      const isOperator = node.nodeType === Node.TEXT_NODE && /^[+\-*/]/.test(currentContent.trim());
      if (
        previousNodeWasMathElement &&
        (isMathElement || isNumberOrSymbol) &&
        index > 0 &&
        !isOperator &&
        !/\s*[+\-*/]\s*/.test(previousContent)
      ) {
        queryString += '*';
      }

      queryString += currentContent;
      previousNodeWasMathElement = isMathElement;
      previousContent = currentContent;
    }
  });

  return queryString.trim();
}