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
    const roundedReal = parseFloat(real.toFixed(2));
    const roundedImag = parseFloat(imag.toFixed(2));
  
    if (roundedReal === 0 && roundedImag === 0) return "0";
    if (roundedReal === 0) {
      if (roundedImag === 1) return "i";
      if (roundedImag === -1) return "-i";
      return `${roundedImag}i`;
    }
    if (roundedImag === 0) return `${roundedReal}`;
  
    const imagAbs = Math.abs(roundedImag);
    const imagPart = imagAbs === 1 ? "i" : `${imagAbs}i`;
    return `${roundedReal} ${roundedImag > 0 ? '+' : '-'} ${imagPart}`;
  }
}

function parseComplex(expr) {
  const cleaned = expr.replace(/\s+/g, '').toLowerCase();
  if (cleaned === 'i') return new Complex(0, 1);
  if (cleaned === '-i') return new Complex(0, -1);
  if (cleaned === '0') return new Complex(0, 0);

  const fullMatch = cleaned.match(/^([+-]?\d*\.?\d*)([+-]\d*\.?\d*)i$/);
  if (fullMatch) {
    const real = fullMatch[1] === '' || fullMatch[1] === '+' || fullMatch[1] === '-' ? 0 : parseFloat(fullMatch[1]);
    const imag = fullMatch[2] === '+' ? 1 : fullMatch[2] === '-' ? -1 : parseFloat(fullMatch[2]);
    return new Complex(real, imag);
  }

  const imagMatch = cleaned.match(/^([+-]?\d*\.?\d*)i$/);
  if (imagMatch) {
    const imag = imagMatch[1] === '' || imagMatch[1] === '+' ? 1 :
                 imagMatch[1] === '-' ? -1 : parseFloat(imagMatch[1]);
    return new Complex(0, imag);
  }

  if (/^[+-]?\d*\.?\d*$/.test(cleaned) && !isNaN(cleaned)) {
    return new Complex(parseFloat(cleaned), 0);
  }

  throw new Error(`Невозможно распарсить: ${expr}`);
}

function tokenize(expr) {
  const cleaned = expr.replace(/\s+/g, '');
  const tokens = [];
  let i = 0;

  while (i < cleaned.length) {
    const char = cleaned[i];
    if ((char === '+' || char === '-') && (
        i === 0 || cleaned[i - 1] === '(' || ['+', '-', '*', '/', '^'].includes(cleaned[i - 1])
      )) {
      let sign = char;
      i++;
      let num = '';
      while (i < cleaned.length && /[0-9.]/.test(cleaned[i])) {
        num += cleaned[i++];
      }
      if (i < cleaned.length && cleaned[i] === 'i') {
        tokens.push(sign + (num || '1') + 'i');
        i++;
      } else if (num !== '') {
        tokens.push(sign + num);
      } else {
        tokens.push(sign);
      }
      continue;
    }

    if (char === '+' || char === '-' || char === '*' || char === '/' || char === '^' || char === '(' || char === ')') {
      tokens.push(char);
      i++;
    } else if (/[0-9.]/.test(char)) {
      let num = '';
      while (i < cleaned.length && /[0-9.]/.test(cleaned[i])) {
        num += cleaned[i++];
      }
      if (i < cleaned.length && cleaned[i] === 'i') {
        tokens.push(num + 'i');
        i++;
      } else {
        tokens.push(num);
      }
    } else if (char === 'i') {
      tokens.push('1i');
      i++;
    } else {
      throw new Error(`Недопустимый символ: ${char}`);
    }
  }
  return tokens;
}

const precedence = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3
};

function toRPN(tokens) {
  const output = [];
  const operators = [];
  for (const token of tokens) {
    if (token.match(/^-?\d+\.?\d*i?$|^-?\.\d+i?$|^-?\d*i$/)) {
      output.push(token);
    } else if (['+', '-', '*', '/', '^'].includes(token)) {
      while (
        operators.length > 0 &&
        operators[operators.length - 1] !== '(' &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        output.push(operators.pop());
      }
      operators.push(token);
    } else if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length > 0 && operators[operators.length - 1] !== '(') {
        output.push(operators.pop());
      }
      if (operators.length === 0) {
        throw new Error("Несоответствие скобок");
      }
      operators.pop();
    }
  }

  while (operators.length > 0) {
    const op = operators.pop();
    if (op === '(') {
      throw new Error("Несоответствие скобок");
    }
    output.push(op);
  }
  return output;
}

function evaluateRPN(rpn) {
  const stack = [];
  for (const token of rpn) {
    if (token.match(/^-?\d+\.?\d*i?$|^-?\.\d+i?$|^-?\d*i$/)) {
      stack.push(parseComplex(token));
    } else {
      if (stack.length < 2) {
        throw new Error("Недостаточно операндов");
      }
      const b = stack.pop();
      const a = stack.pop();

      switch (token) {
        case '+': stack.push(a.add(b)); break;
        case '-': stack.push(a.minus(b)); break;
        case '*': stack.push(a.multiply(b)); break;
        case '/': stack.push(a.divide(b)); break;
        case '^': stack.push(a.pow(b.real)); break;
        default: throw new Error(`Неизвестный оператор: ${token}`);
      }
    }
  }

  if (stack.length !== 1) {
    throw new Error("Некорректное выражение");
  }
  return stack[0];
}

export function evaluateComplexExpression(expr) {
  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  return evaluateRPN(rpn);
}