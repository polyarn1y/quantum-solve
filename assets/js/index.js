import { querySpan, outputSpan, errorContainer, resultContainer, inputField, placeholder } from "./constants.js";
import { Complex, evaluateComplexExpression } from "./complex.js";
import { show, hide, formatNumber } from "./utils.js";
import { addGlobalEventListeners } from "./globalEventLisneters.js";
import { parseExpression } from "./math/parseExpression.js";

addGlobalEventListeners();

export function solve() {
  try {
    hide(errorContainer);
    const hasCustomElements = inputField.querySelectorAll('.fraction, .power, .sqrt').length > 0;
    let expression = hasCustomElements ? parseExpression() : inputField.textContent.trim();
    console.log(hasCustomElements)
    const isComplex = /(?<![a-zA-Z])[i](?![a-zA-Z])/.test(expression);
    let result;
    if (isComplex) {
      result = evaluateComplexExpression(expression);
    } else {
      let evalExpression = expression
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
        result = result === Infinity ? "∞" : "-∞";
      } else if (isNaN(result) || !isFinite(result)) {
        throw new Error("Неверный результат");
      }
    }
    const queryString = hasCustomElements
      ? parseExpression(true)
      : inputField.textContent;
    querySpan.textContent = queryString.replace(/\*/g, '×');

    if (result instanceof Complex) {
      outputSpan.textContent = result.toString();
    } else if (typeof result === 'number') {
      outputSpan.textContent = formatNumber(result);
    } else {
      outputSpan.textContent = result;
    }
    show(resultContainer);
  } catch (error) {
    show(errorContainer);
    hide(resultContainer);
  }
}