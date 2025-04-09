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
    return new Complex(r * Math.cos(theta), r * Math.sin(theta));
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

  if (expression.includes('/')) {
    const parts = expression.split('/').map(part => {
      if (part.startsWith('(') && part.endsWith(')')) {
        return part.slice(1, -1);
      }
      return part;
    });
    const numerator = parseComplex(parts[0]);
    const denominator = parseComplex(parts[1]);
    return numerator.divide(denominator);
  }

  if (expression.includes('*')) {
    const parts = expression.split('*').map(part => {
      if (part.startsWith('(') && part.endsWith(')')) {
        return part.slice(1, -1);
      }
      return part;
    });
    const left = parseComplex(parts[0]);
    const right = parseComplex(parts[1]);
    return left.multiply(right);
  }

  const terms = splitTerms(expression);
  if (terms.length === 0) {
    throw new Error('Пустое выражение');
  }

  let result = parseTerm(terms[0]);
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
  if (term.startsWith('(') && term.endsWith(')')) {
    return parseComplex(term.slice(1, -1));
  }
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
    imagPart = parseFloat(match[1].replace('i', '')) || 1; 
  } else {
    realPart = parseFloat(match[1]) || 0; 
    if (match[2] && match[3]) {
      imagPart = parseFloat(match[3]) * (match[2] === '-' ? -1 : 1);
    }
  }

  return new Complex(realPart, imagPart);
}