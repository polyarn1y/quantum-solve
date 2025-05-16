function gcd(a, b) {
  return b === 0 ? a : gcd(b, Math.abs(a % b));
}

export class Rational {
  constructor(numerator, denominator = 1) {
    if (denominator === 0) {
      throw new Error("Denominator cannot be zero.");
    }
    
    if (denominator < 0) {
      numerator = -numerator;
      denominator = -denominator;
    }

    this.num = numerator;
    this.den = denominator;
    this.simplify();
  }

  simplify() {
    if (this.num === 0) {
        this.den = 1;
        return;
    }
    const common = gcd(this.num, this.den);
    this.num /= common;
    this.den /= common;

    if (this.den < 0) {
        this.num = -this.num;
        this.den = -this.den;
    }
  }

  add(other) {
    const newNum = this.num * other.den + other.num * this.den;
    const newDen = this.den * other.den;
    return new Rational(newNum, newDen);
  }

  subtract(other) {
    const newNum = this.num * other.den - other.num * this.den;
    const newDen = this.den * other.den;
    return new Rational(newNum, newDen);
  }

  multiply(other) {
    const newNum = this.num * other.num;
    const newDen = this.den * other.den;
    return new Rational(newNum, newDen);
  }

  divide(other) {
    if (other.num === 0) {
      throw new Error("Division by zero (rational).");
    }
    const newNum = this.num * other.den;
    const newDen = this.den * other.num;
    return new Rational(newNum, newDen);
  }

  pow(exponent) {
    if (!Number.isInteger(exponent)) {
      throw new Error("Rational power currently only supports integer exponents.");
    }
    if (exponent === 0) return new Rational(1, 1);

    let resNum = Math.pow(this.num, Math.abs(exponent));
    let resDen = Math.pow(this.den, Math.abs(exponent));

    if (exponent < 0) {
      if (resNum === 0) throw new Error("Division by zero in rational power (0 raised to negative power).");
      return new Rational(resDen, resNum);
    }
    return new Rational(resNum, resDen);
  }
  
  toNumber() {
    return this.num / this.den;
  }

  toString() {
    this.simplify();
    if (this.den === 1) {
      return `${this.num}`;
    }
    return `${this.num}/${this.den}`;
  }
}

function parseNumberTokenToRational(token) {
  if (token.includes('.')) throw new Error(`Decimal number "${token}" found in rational expression. Only integers and fractions are supported.`);
  return new Rational(parseInt(token, 10));
}

const RATIONAL_OPERATOR_PRECEDENCE = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
  '_unary_': 4,
};

function tokenizeRationalExpression(expr) {
  const cleanedExpr = expr.replace(/\s+/g, '');
  const tokens = [];
  let i = 0;

  while (i < cleanedExpr.length) {
    const char = cleanedExpr[i];
    const prevToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;

    if (char === '-' && (i === 0 || ['(', '+', '-', '*', '/', '^'].includes(cleanedExpr[i-1]))) {
      tokens.push('_unary_');
      i++;
    } else if (RATIONAL_OPERATOR_PRECEDENCE[char] || char === '(' || char === ')') {
      tokens.push(char);
      i++;
    } else if (/[0-9]/.test(char)) {
      let numStr = '';
      while (i < cleanedExpr.length && /[0-9]/.test(cleanedExpr[i])) {
        numStr += cleanedExpr[i];
        i++;
      }
      tokens.push(numStr);
    } else {
      throw new Error(`Invalid character in rational expression: "${char}" in "${expr}"`);
    }
  }
  return tokens;
}

function convertToRPN(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  tokens.forEach(token => {
    if (/[0-9]/.test(token)) { 
      outputQueue.push(token);
    } else if (token === '_unary_') {
        operatorStack.push(token);
    } else if (RATIONAL_OPERATOR_PRECEDENCE[token]) {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        RATIONAL_OPERATOR_PRECEDENCE[operatorStack[operatorStack.length - 1]] >= RATIONAL_OPERATOR_PRECEDENCE[token]
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop());
      }
      if (operatorStack.length === 0 || operatorStack[operatorStack.length - 1] !== '(') {
        throw new Error("Mismatched parentheses in expression.");
      }
      operatorStack.pop(); 
    }
  });

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op === '(') {
      throw new Error("Mismatched parentheses in expression (stack cleanup).");
    }
    outputQueue.push(op);
  }
  return outputQueue;
}

function evaluateRPN(rpnQueue) {
  const stack = [];
  rpnQueue.forEach(token => {
    if (/[0-9]/.test(token)) { 
      stack.push(parseNumberTokenToRational(token));
    } else if (token === '_unary_') {
      if (stack.length < 1) throw new Error("Invalid RPN: Not enough operands for unary minus.");
      const operand = stack.pop();
      stack.push(new Rational(0).subtract(operand));
    } else {
      if (token === '^' && stack.length < 2) throw new Error("Invalid RPN: Not enough operands for '^'.");
      else if (stack.length < 2 && token !== '^') throw new Error(`Invalid RPN: Not enough operands for '${token}'.`);

      const b = stack.pop();
      const a = stack.pop();
      switch (token) {
        case '+': stack.push(a.add(b)); break;
        case '-': stack.push(a.subtract(b)); break;
        case '*': stack.push(a.multiply(b)); break;
        case '/': stack.push(a.divide(b)); break;
        case '^': stack.push(a.pow(b.toNumber())); break;
        default: throw new Error(`Unknown operator in RPN: ${token}`);
      }
    }
  });

  if (stack.length !== 1) {
    throw new Error("Invalid RPN expression: Stack should contain exactly one result.");
  }
  return stack[0];
}

export function evaluateRationalExpression(expressionString) {
  try {
    const tokens = tokenizeRationalExpression(expressionString);
    const rpn = convertToRPN(tokens);
    return evaluateRPN(rpn);
  } catch (e) {
    throw e; 
  }
} 