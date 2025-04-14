import { querySpan, outputSpan, errorContainer, resultContainer, inputField, placeholder } from "./constants.js";
import { Complex, evaluateComplexExpression } from "./complex.js";
import { show, hide } from "./domUtils.js";
import { addGlobalEventListeners } from "./globalEventLisneters.js";

addGlobalEventListeners();

export function solve() {
  try {
    hide(errorContainer);
    const expression = inputField.textContent.trim();
    const isComplex = /[i]/.test(expression);
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

    const queryString = expression.replace(/\*/g, '×');
    querySpan.textContent = queryString;
    outputSpan.textContent = result instanceof Complex ? result.toString() : result;

    show(resultContainer);
  } catch (error) {
    show(errorContainer);
    hide(resultContainer);
  }
}