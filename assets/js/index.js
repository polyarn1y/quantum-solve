import { querySpan, outputSpan, errorContainer, resultContainer, inputField } from "./constants.js";
import { Complex, parseComplex } from "./complex.js";
import { show, hide } from "./domUtils.js";
import { addEventListeners } from "./eventLisneters.js";

addEventListeners();

export function solve(expression) {
  try {
    hide(errorContainer);
    expression = parseComplex(expression);

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