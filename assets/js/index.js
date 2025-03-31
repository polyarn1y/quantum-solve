import { querySpan, outputSpan, errorContainer, resultContainer, inputField } from "./constants.js";
import { Complex, parseComplex } from "./complex.js";
import { show, hide } from "./domUtils.js";
import { addEventListeners } from "./eventLisneters.js";

addEventListeners();
export function solve(expression) {
  try {
    hide(errorContainer);
    
    const isComplex = /[i]/.test(expression);
    let result;

    if (isComplex) {
      result = parseComplex(expression);
    } else {
      expression = expression
        .replace(/π/g, 'Math.PI')
        .replace(/∞/g, 'Infinity')
        .replace(/sin\(([^)]+)\)/g, "Math.sin($1)")
        .replace(/cos\(([^)]+)\)/g, "Math.cos($1)")
        .replace(/tan\(([^)]+)\)/g, "Math.tan($1)")
        .replace(/exp\(([^)]+)\)/g, "Math.exp($1)")
        .replace(/log\(([^)]+)\)/g, "Math.log($1)")
        .replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)")
        .replace(/\^/g, '**');

      result = eval(expression);
      
      if (isNaN(result) || !isFinite(result)) {
        throw new Error("Invalid result");
      }
    }

    const queryString = inputField.value.trim().replace(/\*/g, '×');
    
    querySpan.textContent = queryString;
    outputSpan.textContent = result instanceof Complex ? result.toString() : result;

    show(resultContainer);
    
  } catch (error) {
    show(errorContainer);
    hide(resultContainer);
  }
}