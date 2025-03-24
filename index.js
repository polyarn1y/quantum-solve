const inputField = document.getElementById("inputField");
const solveButton = document.getElementById("solveButton");
const keyboardButton = document.getElementById("keyboardInputButton");
const inputFieldError = document.getElementById("inputFieldError");  
const keyboardContainer = document.getElementById("keyboardContainer");
const errorContainer = document.getElementById("error-container");

function getInputValue() {
  return inputField.value;
}

inputField.addEventListener('keypress', (event) => {
  if(event.key === "Enter") {
    solve(getInputValue());
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
