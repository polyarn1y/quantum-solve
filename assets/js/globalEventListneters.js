import { 
  inputField,
  solveButton,
  mathButton,
  mathContainer,
  keyboardButton,
  keyboardContainer,
  outputSpan,
  closeButton,
  additional,
  helpButton,
  modal,
} from "./constants.js";
import { solve, showMoreDigits, showLessDigits } from "./index.js";
import { toggle, show, hide } from "./utils.js";
import { removeLoader } from './loader.js';
import { checkFractionPartFocus, checkPowerPartFocus, mathField } from "./mq.js";


const containers = {
  favourite: document.querySelector('.mathInput__container-favourite'),
  root: document.querySelector('.mathInput__container-root'),
  trigonometric: document.querySelector('.mathInput__container-trigonometric')
};

export function addGlobalEventListeners() {
  window.addEventListener('load', () => {
    removeLoader();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      solve();
    }
  });

  helpButton.addEventListener("click", (e) => {
    e.preventDefault();
    toggle(modal);
  });

  closeButton.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });

  inputField.addEventListener('keydown', function(event) {
    if (event.key === '_') {
      event.preventDefault();
    }
    if (event.key === '\\') {
        event.preventDefault();
        checkFractionPartFocus();
    }
    if (event.key === '^') {
      setTimeout(() => {
          checkPowerPartFocus();
      }, 0);
    }
  });

  inputField.addEventListener('keydown', function(event) {
    checkPowerPartFocus();
    checkFractionPartFocus();
  });
  
  inputField.addEventListener('mousedown', function(event) {
    checkFractionPartFocus();
    checkPowerPartFocus();
  });

  closeButton.addEventListener('click', () => {
    helpModal.classList.remove('active');
  });
  
  solveButton.addEventListener('click', () => {
    solve();
  });
  
  const moreDigitsButton = document.getElementById('moreDigitsButton');
  moreDigitsButton.addEventListener('click', () => {
    showMoreDigits();
  });

  const lessDigitsButton = document.getElementById('lessDigitsButton');
  lessDigitsButton.addEventListener('click', () => {
    showLessDigits();
  });

  mathButton.addEventListener('click', () => {
    toggle(mathContainer);
    if (!keyboardContainer.classList.contains('hide')) {
      hide(keyboardContainer);
    }

    if (mathButton.classList.contains('active')) {
      additional.classList.remove('active');
      mathButton.classList.remove('active');
      Object.values(containers).forEach(container => container.style.display = 'none');
      const additionalButtons = document.querySelectorAll('.toolbar__button-additional');
      additionalButtons.forEach(btn => btn.classList.remove('active'));
    } else {
      mathButton.classList.add('active');
      additional.classList.add('active');

      const additionalButtons = document.querySelectorAll('.toolbar__button-additional');
      additionalButtons.forEach((btn, index) => {
        if (index === 0) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      Object.values(containers).forEach(container => container.style.display = 'none');
      if (containers.favourite) {
        containers.favourite.style.display = 'flex';
      }
    }

    if (keyboardButton.classList.contains('active')) {
      keyboardButton.classList.remove('active');
    }
  });

  const keyboardKeys = document.querySelectorAll('.keyboard__key');
  keyboardKeys.forEach(button => {
      button.addEventListener('click', () => {
          const cmd = button.dataset.cmd;
          const text = button.dataset.text;
          if (cmd) {
              if (cmd === '\\sqrt') {
                mathField.cmd(cmd);
                mathField.focus();
                return;
              }
              mathField.cmd(cmd);
          } else if (text) {
              mathField.typedText(text);
          }
          mathField.focus();
      });
  });
  
  keyboardButton.addEventListener('click', () => {
    toggle(keyboardContainer);
    if (!mathContainer.classList.contains('hide')) {
      hide(mathContainer);
    }
    if (keyboardButton.classList.contains('active')) {
        keyboardButton.classList.remove('active');
    } else {
        keyboardButton.classList.add('active');
        additional.classList.remove('active');
        Object.values(containers).forEach(container => container.style.display = 'none');
        const additionalButtons = document.querySelectorAll('.toolbar__button-additional');
        additionalButtons.forEach(btn => btn.classList.remove('active'));
    }

    if (mathButton.classList.contains('active')) {
      mathButton.classList.remove('active');
    }
  });

  const additionalButtons = document.querySelectorAll('.toolbar__button-additional');
  additionalButtons.forEach(clickedButton => {
    clickedButton.addEventListener('click', () => {
      const setName = clickedButton.getAttribute('data-set');
      additionalButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      clickedButton.classList.add('active');
      Object.values(containers).forEach(container => {
        if (container) container.style.display = 'none';
      });
      if (containers[setName]) {
        containers[setName].style.display = 'flex';
      }
    });
  });

  const mathInputKeys = document.querySelectorAll('.mathInput__key');
  const commandMap = {
    fraction: { action: 'fraction', cmd: '\\frac' },
    sqrt: { action: 'sqrt', cmd: '\\sqrt' },
    power: { action: 'power', typedText: '^' },
    square: { action: 'square', typedText: '^2' },
    cube: { action: 'cube', typedText: '\\nthroot3' },
    pi: { action: 'pi', cmd: '\\pi' },
    degree: { action: 'degree', cmd: '\\degree' },
    sin: { action: 'sin', typedText: 'sin(' },
    cos: { action: 'cos', typedText: 'cos(' },
    tan: { action: 'tan', typedText: 'tan(' },
    sec: { action: 'sec', typedText: 'sec(' },
    csc: { action: 'csc', typedText: 'csc(' },
    cot: { action: 'cot', typedText: 'cot(' },
    sinh: { action: 'sinh', typedText: 'sinh(' },
    cosh: { action: 'cosh', typedText: 'cosh(' },
    tanh: { action: 'tanh', typedText: 'tanh(' }, 
    sech: { action: 'sech', typedText: 'sech(' },
    csch: { action: 'csch', typedText: 'csch(' },
    coth: { action: 'coth', typedText: 'coth(' },
    sin_inv: { action: 'sin_inv', typedText: 'arcsin(' },
    cos_inv: { action: 'cos_inv', typedText: 'arccos(' },
    tan_inv: { action: 'tan_inv', typedText: 'arctan(' },
    sinh_inv: { action: 'sinh_inv', typedText: 'arcsinh(' },
    cosh_inv: { action: 'cosh_inv', typedText: 'arccosh(' },
    tanh_inv: { action: 'tanh_inv', typedText: 'arctanh(' },
    sech_inv: { action: 'sech_inv', typedText: 'arcsech(' },
    csch_inv: { action: 'csch_inv', typedText: 'arccsch(' },
    coth_inv: { action: 'coth_inv', typedText: 'arccoth(' },
    nth: { action: 'nth', typedText: '\\nthroot(' },
    infinity: { action: 'infinity', cmd: '\\infty' },
    negative_infinity: { action: 'negative_infinity', cmd: '\\infty' },
    e: { action: 'e', typedText: 'e' },
    e_power: { action: 'e_power', typedText: 'e^' },
    natural_log: { action: 'natural_log', typedText: 'ln(' },
    log: { action: 'log' },
    common_log: { action: 'common_log', typedText: 'log_{10}(' },
  };

  mathInputKeys.forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const commandDetails = commandMap[action];
      if (action === 'negative_infinity') {
        mathField.typedText('-');
      }
      if (action === 'common_log') {
        mathField.typedText('log_(');
        mathField.keystroke('Left');

      } else if (commandDetails.typedText) {
        if (action === 'power' || action === 'square') {
          mathField.typedText(commandDetails.typedText);
          mathField.keystroke('Left'); 
          mathField.keystroke('Left');
          mathField.keystroke('Left');
        } else if (action === 'cube') {
          mathField.typedText(commandDetails.typedText);
          mathField.keystroke('Right');
        } else {
          mathField.typedText(commandDetails.typedText);
        }
      } else if (commandDetails.cmd) {
        mathField.cmd(commandDetails.cmd);
      }
      mathField.focus();
    });
  });   
} 

