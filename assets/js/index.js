import { querySpan, outputSpan, errorContainer, resultContainer, inputField } from "./constants.js";
import { Complex, parseComplex } from "./complex.js";
import { show, hide } from "./domUtils.js";
import { addEventListeners } from "./eventLisneters.js";

addEventListeners();

export function solve(expression) {
  try {
    hide(errorContainer);
    const isComplex = /\d+i/.test(expression) || /\b(?:\d+\s*[-+]\s*\d+i)\b/.test(expression);

    if (isComplex) {
      expression = parseComplex(expression);
    } else {
      expression = expression.replace(/sin\(([^)]+)\)/g, "Math.sin($1)");
      expression = expression.replace(/cos\(([^)]+)\)/g, "Math.cos($1)");
      expression = expression.replace(/tan\(([^)]+)\)/g, "Math.tan($1)");
      expression = expression.replace(/exp\(([^)]+)\)/g, "Math.exp($1)");
      expression = expression.replace(/log\(([^)]+)\)/g, "Math.log($1)");
      expression = expression.replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)");
    }

    let result = eval(expression);

    if (!(result instanceof Complex) && (isNaN(result) || !isFinite(result))) {
      throw new Error("");
    }
 
    let queryString = inputField.value.trim().toString().replace(/\*/g, 'x');


    querySpan.textContent = queryString;
    outputSpan.textContent = result;

    show(resultContainer);

  } catch (error) {
    show(errorContainer);
    hide(resultContainer);
  }
}