import { querySpan, outputSpan, errorContainer, resultContainer, inputField, placeholder } from "./constants.js";
import { show, hide } from "./utils.js";
import { mathField } from "./mq.js";
import { addGlobalEventListeners } from "./globalEventLisneters.js";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

addGlobalEventListeners();

function replaceFractions(expr) {
  let result = '';
  let i = 0;

  while (i < expr.length) {
    if (expr.startsWith('\\frac{', i)) {
      i += 6;
      const numerator = extractGroup(expr, i);
      i += numerator.length + 1;

      if (expr[i] !== '{') throw new Error('Expected { for denominator');
      i++;
      const denominator = extractGroup(expr, i);
      i += denominator.length + 1;

      const replacedNumerator = replaceFractions(numerator);
      const replacedDenominator = replaceFractions(denominator);
      result += `(${replacedNumerator})/(${replacedDenominator})`;
    } else {
      result += expr[i++];
    }
  }

  return result;
}

function replacePowers(expr) {
  let result = '';
  let i = 0;

  while (i < expr.length) {
    if (expr[i] === '^' && expr[i + 1] === '{') {
      i += 2; 
      const power = extractGroup(expr, i);
      i += power.length + 1; 
      const replacedPower = replacePowers(power); 
      result += '^(' + replacedPower + ')';
    } else {
      result += expr[i++];
    }
  }

  return result;
}

function replaceSqrt(expr) {
  let result = '';
  let i = 0;

  while (i < expr.length) {
    if (expr.startsWith('\\sqrt{', i)) {
      i += 6; 
      const content = extractGroup(expr, i);
      i += content.length + 1; 

      const replacedContent = replaceFractions(replacePowers(replaceSqrt(content))); 


      result += `sqrt(${replacedContent})`;
    } else if (expr.startsWith('\\sqrt[', i)) { 
      i += 6;   
      const degree = extractGroup(expr, i); 
      i += degree.length + 1; 
      
      if (expr[i] !== '{') throw new Error('Expected { for nth root content');
      i++; 
      const content = extractGroup(expr, i);
      i += content.length + 1; 

      const replacedDegree = replaceFractions(replacePowers(replaceSqrt(degree)));
      const replacedContent = replaceFractions(replacePowers(replaceSqrt(content)));
      result += `(${replacedContent})^(1/(${replacedDegree}))`; 
    } else {
      result += expr[i++];
    }
  }
  return result;
}

function extractGroup(str, startIndex) {
  let depth = 1;
  let i = startIndex;
  let group = '';

  while (i < str.length && depth > 0) {
    if (str[i] === '{') {
      depth++;
    } else if (str[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
    if (depth > 0) group += str[i];
    i++;
  }

  return group;
}

export function solve() {
  let expression;
  try {
    hide(errorContainer);
    hide(resultContainer);
    expression = mathField.latex();
    console.log(expression);
    expression = replaceFractions(expression);
    expression = replacePowers(expression);
    expression = replaceSqrt(expression);
    
    const replacements = [
      { latex: "\\left(", plain: '(' },
      { latex: "\\right)", plain: ')' },
      { latex: "\\cdot", plain: '*' },
      { latex: "\\sin", plain: 'sin' },
      { latex: "\\cos", plain: 'cos' },
      { latex: "\\tan", plain: 'tan' },
      { latex: "\\sec", plain: 'sec' },
      { latex: "\\csc", plain: 'csc' },
      { latex: "\\cot", plain: 'cot' },
      { latex: "\\sinh", plain: 'sinh' },
      { latex: "\\cosh", plain: 'cosh' },
      { latex: "\\tanh", plain: 'tanh' },
      { latex: "\\operatorname{sech}", plain: 'sech' },
      { latex: "\\operatorname{csch}", plain: 'csch' },
      { latex: "\\operatorname{coth}", plain: 'coth' },
      { latex: "\\log", plain: 'log' },
      { latex: "\\ln", plain: 'ln' },
      { latex: "\\pi", plain: 'pi' },
      { latex: "\\%", plain: '%' },
      { latex: "\\max", plain: 'max' },
    ];

    for (const rule of replacements) {
      const regex = new RegExp(escapeRegExp(rule.latex), 'g');
      expression = expression.replace(regex, rule.plain);
    }

    console.log(expression);

    const incompleteFunctions = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'sinh', 'cosh', 'tanh', 'sec', 'csc', 'cot', 'sinh_inv', 'cosh_inv', 'tanh_inv', 'sech_inv', 'csch_inv', 'coth_inv',
      'sech', 'csch', 'coth'
    ];
    const trimmedExpression = expression.trim();
    
    if (incompleteFunctions.includes(trimmedExpression) || 
        incompleteFunctions.some(func => trimmedExpression.endsWith(func) && !trimmedExpression.includes('('))) {
      show(errorContainer);
      outputSpan.textContent = '';
      return;
    }

    querySpan.textContent = expression;

    hide(resultContainer);
    resultContainer.classList.remove('active');

    void resultContainer.offsetHeight;

    if (expression.trim() === '') {
      show(errorContainer);
      outputSpan.textContent = '';
      return;
    }

    let result = math.evaluate(expression);
    console.log("Результат вычисления:", result);
    if (typeof result === 'number' && !Number.isInteger(result)) {
      result = parseFloat(result.toFixed(10));
    }

    if (result && typeof result.toString === 'function') {
        outputSpan.textContent = result.toString();
    } else {
        outputSpan.textContent = result;
    }

    show(resultContainer);
    resultContainer.classList.add('active');

  } catch (error) {
    hide(resultContainer);
    resultContainer.classList.remove('active');
    show(errorContainer);
    outputSpan.textContent = '';
  }
}