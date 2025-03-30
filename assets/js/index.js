import { querySpan, outputSpan, errorContainer, resultContainer, inputField } from "./constants.js";
import { Complex } from "./complex.js";
import { addEventListeners } from "./eventLisneters.js";

addEventListeners();

// export function solve(expression) {
//   try {
//     let input = inputField.value.trim();
    
//     if (!(result instanceof Complex) && (isNaN(result) || !isFinite(result))) {
//       throw new Error("Invalid expression");
//     }

//     querySpan.textContent = input;
//     outputSpan.textContent = result.toString();
//     resultContainer.classList.add("active");
//     errorContainer.classList.remove("active");
//   } catch (error) {
//     errorContainer.classList.add("active");
//     querySpan.textContent = "";
//     outputSpan.textContent = "";
//     resultContainer.classList.remove("active");
//   }
// }
