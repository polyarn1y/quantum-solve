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
    if (this.real === 0 && this.imag === 0) {
      return "0";
    }
    if (this.real === 0) {
      return `${this.imag}i`;
    }
    if (this.imag === 0) {
      return `${this.real}`;
    }
    return `${this.real} ${this.imag > 0 ? '+' : '-'} ${Math.abs(this.imag)}i`; // Оба числа ненулевые
  }
}