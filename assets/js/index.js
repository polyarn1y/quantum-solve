import { inputField, solveButton, keyboardButton, keyboardContainer, querySpan, outputSpan, errorContainer } from "./constants.js";
import { Complex } from "./complex.js";

window.addEventListener("load", () => {
  document.getElementById("loader").classList.add("hidden");
});

inputField.addEventListener('keypress', (event) => {
  if (event.key === "Enter") {
      solve(inputField.value);
  }
})

solveButton.addEventListener('click', () => {
  solve(inputField.value);
})

// keyboardButton.addEventListener('click', () => {
//   keyboardContainer.classList.toggle("active");
//   keyboardButton.classList.toggle("active");
// });

function solve(expression) {
  try {
    let result = eval(expression);
    if (isNaN(result) || !isFinite(result)) {
      throw new Error("Invalid expression");
    }

    querySpan.textContent = expression;
    outputSpan.textContent = result;
    document.querySelector(".result").classList.add("active");
    document.querySelector(".error").classList.remove("active");
  } catch (error) {
    // Показываем блок ошибки
    errorContainer.classList.add("active");
    
    // Очищаем результат
    querySpan.textContent = "";
    outputSpan.textContent = "";
    document.querySelector(".result").classList.remove("active");
  }
}
