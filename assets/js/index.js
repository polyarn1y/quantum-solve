import { querySpan, outputSpan, errorContainer, resultContainer, inputField, placeholder } from "./constants.js";
import { show, hide } from "./utils.js";
import { mathField } from "./mq.js";
import { addGlobalEventListeners } from "./globalEventListneters.js";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

addGlobalEventListeners();

const trigFunctions = ['sin', 'cos', 'tan', 'sec', 'cot', 'csc'];
const inverseTrigFunctions = ['acos', 'atan', 'atan2', 'acot', 'acsc', 'asec'];

let replacements = {};

function wrapTrigFunction(name, originalFn) {
  return function(x) {
    const degrees = x;
    const radians = degrees * Math.PI / 180;
    const rem180 = degrees % 180;

    if ((name === 'tan' || name === 'sec') && Math.abs(rem180 - 90) < 1e-9) {
      return Infinity;
    }

    if ((name === 'cot' || name === 'csc') && Math.abs(rem180) < 1e-9) {
      return Infinity;
    }

    return originalFn(radians);
  };
}

trigFunctions.forEach(name => {
  const originalFn = math[name];
  replacements[name] = wrapTrigFunction(name, originalFn);
});

inverseTrigFunctions.forEach(name => {
  const originalFn = math[name];
  replacements[name] = function(x) {
    const result = originalFn(x);
    return result * 180 / Math.PI;
  };
});

math.import(replacements, { override: true });

let currentExpression = '';
const DEFAULT_PRECISION = 10;
const PRECISION_STEP = 15;
let currentPrecision = DEFAULT_PRECISION;

const moreDigitsButton = document.getElementById('moreDigitsButton');
const lessDigitsButton = document.getElementById('lessDigitsButton');

export function showMoreDigits() {
  const newPrecision = currentPrecision + PRECISION_STEP;
  solve(newPrecision, true);
}

export function showLessDigits() {
  const newPrecision = Math.max(DEFAULT_PRECISION, currentPrecision - PRECISION_STEP);
  solve(newPrecision, true);
}

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
    if (expr.startsWith('\\sqrt[', i)) {
      i += 6;
      let degree = '';
      while (i < expr.length && expr[i] !== ']') {
        degree += expr[i];
        i++;
      }
      if (expr[i] === ']') {
        i++;
      } else {
        throw new Error(`ОШИБКА: Не найдена ']' после степени, текущий символ: "${expr[i]}"`);
      }
      if (expr[i] !== '{') throw new Error(`ОШИБКА: Ожидалась '{' после степени, но найдено: "${expr[i]}" на позиции ${i}`);
      i++;
      const content = extractGroup(expr, i);
      i += content.length + 1;
      const replacedContent = replaceFractions(replacePowers(replaceSqrt(content)));
      const replacedDegree = replaceFractions(replacePowers(replaceSqrt(degree)));
      if (degree === '1') {
        result += `(${replacedContent})`;
      } else if (degree === '2') {
        result += `sqrt(${replacedContent})`;
      } else if (degree === '3') {
        result += `cbrt(${replacedContent})`;
      } else {
        result += `(${replacedContent})^(1/(${replacedDegree}))`;
      }
    } else if (expr.startsWith('\\sqrt{', i)) {
      i += 6;
      const content = extractGroup(expr, i);
      i += content.length + 1; 
      const replacedContent = replaceFractions(replacePowers(replaceSqrt(content)));
      result += `sqrt(${replacedContent})`;
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

export function solve(precision = DEFAULT_PRECISION, isPrecisionChange = false) {
  try {
    if (!isPrecisionChange) {
      hide(resultContainer);
      currentPrecision = DEFAULT_PRECISION;
    } else {
      currentPrecision = precision;
    }
    hide(errorContainer);
    if (moreDigitsButton) hide(moreDigitsButton);
    if (lessDigitsButton) hide(lessDigitsButton);

    currentExpression = mathField.latex();
    let expression = currentExpression;
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
      { latex: "\\degree", plain: '' },
      { latex: "\\arcsin", plain: 'asin' },
      { latex: "\\arccos", plain: 'acos' },
      { latex: "\\arctan", plain: 'atan' },
      { latex: "\\acot", plain: 'acot' },
      { latex: "\\acsc", plain: 'acsc' },
      { latex: "\\asec", plain: 'asec' },
      { latex: "\\arcsinh", plain: 'asinh' },
      { latex: "\\arccosh", plain: 'acosh' },
      { latex: "\\arctanh", plain: 'atanh' },
      { latex: "\\arcsech", plain: 'asech' },
      { latex: "\\arccsch", plain: 'acsch' },
      { latex: "\\arccoth", plain: 'acoth' },
    ];

    console.log(expression);

    for (const rule of replacements) {
      const regex = new RegExp(escapeRegExp(rule.latex), 'g');
      expression = expression.replace(regex, rule.plain);
    }

    expression = expression.replace(/\bpi\b/g, '(180)');
    querySpan.textContent = expression;

    console.log(expression);


    if (!isPrecisionChange) {
      hide(resultContainer);
      void resultContainer.offsetHeight;
    }

    if (expression.trim() === '') {
      show(errorContainer);
      outputSpan.textContent = '';
      hide(resultContainer);
      return;
    }

    let evaluatedResult = math.evaluate(expression);
    hide(errorContainer);
    show(resultContainer);

    if (evaluatedResult && typeof evaluatedResult === 'object' && 're' in evaluatedResult && 'im' in evaluatedResult) {
      const re = evaluatedResult.re;
      const im = evaluatedResult.im;

      const formatted =
        (re !== 0 ? re : '') +
        (im !== 0 ? (im > 0 && re !== 0 ? ' + ' : (im < 0 ? ' - ' : '')) + (Math.abs(im) !== 1 ? Math.abs(im) : '') + 'i' : '');

      outputSpan.textContent = formatted || '0';
      if (moreDigitsButton) hide(moreDigitsButton);
      if (lessDigitsButton) hide(lessDigitsButton);
      return;
    }

    if (typeof evaluatedResult === 'number' && !Number.isInteger(evaluatedResult) && isFinite(evaluatedResult)) {
        try {
            const fraction = math.fraction(evaluatedResult);
            if (fraction.d < 1000 && fraction.n !== 0 && fraction.d !== 1) { 
                outputSpan.textContent = math.format(fraction, { fraction: 'ratio' });
                if (moreDigitsButton) hide(moreDigitsButton);
                if (lessDigitsButton) hide(lessDigitsButton);
                return;
            } else if (fraction.n === 0 && fraction.d === 1) { 
                 outputSpan.textContent = '0';
                 if (moreDigitsButton) hide(moreDigitsButton);
                 if (lessDigitsButton) hide(lessDigitsButton);
                 return;
            }
            outputSpan.textContent = Number(evaluatedResult.toFixed(currentPrecision)).toString();
        } catch (e) {
            outputSpan.textContent = Number(evaluatedResult.toFixed(currentPrecision)).toString();
        }
        
        const numericValueAtCurrentPrecision = parseFloat(evaluatedResult.toFixed(currentPrecision));
        if (numericValueAtCurrentPrecision !== evaluatedResult) {
            if (moreDigitsButton) show(moreDigitsButton);
        } else {
            if (moreDigitsButton) hide(moreDigitsButton);
        }
        if (currentPrecision > DEFAULT_PRECISION) { 
            if (lessDigitsButton) show(lessDigitsButton);
        } else {
            if (lessDigitsButton) hide(lessDigitsButton);
        }
    } 
    else if (typeof evaluatedResult === 'number' && Math.abs(evaluatedResult) === Infinity) {
        outputSpan.textContent = evaluatedResult === Infinity ? '∞' : '-∞';
        if (moreDigitsButton) hide(moreDigitsButton);
        if (lessDigitsButton) hide(lessDigitsButton);
    } 
    else { 
        if (evaluatedResult && typeof evaluatedResult.toString === 'function') {
            outputSpan.textContent = evaluatedResult.toString();
        } else {
            outputSpan.textContent = String(evaluatedResult);
        }
        if (moreDigitsButton) hide(moreDigitsButton);
        if (lessDigitsButton) hide(lessDigitsButton);
    }

  } catch (error) {
    hide(resultContainer);
    show(errorContainer);
    outputSpan.textContent = '';
    if (moreDigitsButton) hide(moreDigitsButton);
    if (lessDigitsButton) hide(lessDigitsButton);
  }
}