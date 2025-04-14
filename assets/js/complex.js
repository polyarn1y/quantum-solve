export class Complex {
  constructor(real, imag) {
    this.real = real;
    this.imag = imag;
  }

  add(other) {
    return new Complex(this.real + other.real, this.imag + other.imag);
  }

  minus(other) {
    return new Complex(this.real - other.real, this.imag - other.imag);
  }

  multiply(other) {
    const real = this.real * other.real - this.imag * other.imag;
    const imag = this.real * other.imag + this.imag * other.real;
    return new Complex(real, imag);
  }

  divide(other) {
    const denom = other.real ** 2 + other.imag ** 2;
    const real = (this.real * other.real + this.imag * other.imag) / denom;
    const imag = (this.imag * other.real - this.real * other.imag) / denom;
    return new Complex(real, imag);
  }

  modulus() {
    return Math.sqrt(this.real ** 2 + this.imag ** 2);
  }

  argument() {
    return Math.atan2(this.imag, this.real);
  }

  conjugate() {
    return new Complex(this.real, -this.imag);
  }

  pow(n) {
    const r = this.modulus() ** n;
    const theta = this.argument() * n;
    const real = r * Math.cos(theta);
    const imag = r * Math.sin(theta);
    return new Complex(
      Math.abs(real) < 1e-15 ? 0 : real,
      Math.abs(imag) < 1e-15 ? 0 : imag
    );
  }

  exp() {
    const eReal = Math.exp(this.real);
    return new Complex(eReal * Math.cos(this.imag), eReal * Math.sin(this.imag));
  }

  log() {
    return new Complex(Math.log(this.modulus()), this.argument());
  }

  sin() {
    return new Complex(
      Math.sin(this.real) * Math.cosh(this.imag),
      Math.cos(this.real) * Math.sinh(this.imag)
    );
  }

  cos() {
    return new Complex(
      Math.cos(this.real) * Math.cosh(this.imag),
      -Math.sin(this.real) * Math.sinh(this.imag)
    );
  }

  tan() {
    return this.sin().divide(this.cos());
  }

  toString() {
    const { real, imag } = this;
    if (real === 0 && imag === 0) return "0";
    if (real === 0) return imag === 1 ? "i" : imag === -1 ? "-i" : `${imag}i`;
    if (imag === 0) return `${real}`;
    
    const imagAbs = Math.abs(imag);
    const imagPart = imagAbs === 1 ? (imag > 0 ? "i" : "-i") : `${imagAbs}i`;
    return `${real} ${imag > 0 ? '+' : '-'} ${imagPart}`;
  }
}

const operators = {
  '/': (a, b) => a.divide(b),
  '*': (a, b) => a.multiply(b),
  '+': (a, b) => a.add(b),
  '-': (a, b) => a.minus(b)
};

export function parseComplex(expression) {
  expression = expression.replace(/\s+/g, '');

  while (expression.includes('--')) {
    expression = expression.replace('--', '+');
  }
  // Handle exponentiation (^)
  let parenCount = 0;
  for (let i = 0; i < expression.length; i++) {
    if (expression[i] === '(') parenCount++;
    if (expression[i] === ')') parenCount--;
    if (expression[i] === '^' && parenCount === 0) {
      const parts = [expression.slice(0, i), expression.slice(i + 1)];
      const base = parseComplex(parts[0]);
      const exponent = parseFloat(parts[1]);
      if (isNaN(exponent)) {
        throw new Error('Invalid exponent: ' + parts[1]);
      }
      return base.pow(exponent);
    }
  }

  // Split into terms (separated by + or -) at the top level
  const terms = splitTerms(expression);
  if (terms.length === 0) {
    throw new Error('Пустое выражение');
  }

  // Parse the first term
  let result = parseTerm(terms[0]);

  // If there's only one term, check for multiplication/division at the top level
  if (terms.length === 1) {
    for (let op of ['/', '*']) {
      let parenCount = 0;
      for (let i = 0; i < terms[0].length; i++) {
        if (terms[0][i] === '(') parenCount++;
        if (terms[0][i] === ')') parenCount--;
        if (terms[0][i] === op && parenCount === 0) {
          const parts = [terms[0].slice(0, i), terms[0].slice(i + 1)];
          const left = parseComplex(parts[0]);
          const right = parseComplex(parts[1]);
          return operators[op](left, right);
        }
      }
    }
  }

  // Combine terms with + or -
  for (let i = 1; i < terms.length; i++) {
    let term = terms[i];
    let coefficient = 1;
    if (term.startsWith('+')) {
      term = term.slice(1);
    } else if (term.startsWith('-')) {
      coefficient = -1;
      term = term.slice(1);
    }
    const parsedTerm = parseTerm(term);
    result = coefficient === 1 ? result.add(parsedTerm) : result.minus(parsedTerm);
  }

  return result;
}

function parseTerm(term) {
  // Handle parentheses within a term
  if (term.startsWith('(') && term.endsWith(')')) {
    let parenCount = 0;
    let isValid = true;
    for (let i = 0; i < term.length; i++) {
      if (term[i] === '(') parenCount++;
      if (term[i] === ')') parenCount--;
      if (parenCount < 0) {
        isValid = false;
        break;
      }
    }
    if (isValid && parenCount === 0) {
      return parseComplex(term.slice(1, -1));
    }
  }

  // If no multiplication/division at the top level, parse as a single complex number
  return parseSingleComplex(term);
}

function splitTerms(expression) {
  const terms = [];
  let currentTerm = '';
  let parenCount = 0;

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;

    if ((char === '+' || char === '-') && parenCount === 0 && i > 0) {
      if (currentTerm) terms.push(currentTerm);
      currentTerm = char;
    } else {
      currentTerm += char;
    }
  }
  if (currentTerm) terms.push(currentTerm);

  return terms;
}

function parseSingleComplex(str) {
  const complexRegex = /^([-+]?\d*\.?\d*i?|[-+]?\d*\.?\d+)(?:([-+])\s*(\d*\.?\d*)i)?$/i;
  const match = str.match(complexRegex);

  if (!match) {
    throw new Error('Не удалось распарсить комплексное число: ' + str);
  }

  let realPart = 0;
  let imagPart = 0;

  if (match[1].endsWith('i')) {
    const coeff = match[1].replace('i', '');
    imagPart = parseFloat(coeff) || (coeff === '' || coeff === '+' ? 1 : -1);
  } else {
    realPart = parseFloat(match[1]) || 0;
    if (match[2] && match[3]) {
      const coeff = match[3];
      imagPart = parseFloat(coeff) * (match[2] === '-' ? -1 : 1) || (coeff === '' ? (match[2] === '-' ? -1 : 1) : 0);
    }
  }

  return new Complex(realPart, imagPart);
}