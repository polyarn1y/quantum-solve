import { inputField, solveButton, keyboardButton, keyboardContainer, querySpan, outputSpan, errorContainer } from "./constants.js";



inputField.addEventListener('keypress', (event) => {
  if(event.key === "Enter") {
      // solve
  }
})

solveButton.addEventListener('click', () => {
  solve(getInputValue());
})

keyboardButton.addEventListener('click', () => {
  keyboardContainer.classList.toggle("active");
  keyboardButton.classList.toggle("active");
});

function solve(expression) {
  try {
    let result = eval(expression);
    console.log(result)
    if (!Number.isInteger(result)) {
      errorContainer.classList.toggle("active");
      console.log('not a number')
    } else {
      errorContainer.classList.toggle("active");
      console.log('not a number')

    }
    
  } catch (error) {
  }
}
