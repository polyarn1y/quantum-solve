export class TrigParser {
    constructor() {
        this.PI = Math.PI;
        this.trigFunctions = {
            'sin': Math.sin,
            'cos': Math.cos,
            'tan': Math.tan,
            'sec': (x) => 1 / Math.cos(x),
            'csc': (x) => 1 / Math.sin(x),
            'cot': (x) => 1 / Math.tan(x),
            'sinh': Math.sinh,
            'cosh': Math.cosh,
            'tanh': Math.tanh,
            'sech': (x) => 1 / Math.cosh(x),
            'csch': (x) => 1 / Math.sinh(x),
            'coth': (x) => 1 / Math.tanh(x)
        };

        this.inverseTrigFunctions = {
            'sin-1': (x) => {
                if (x < -1 || x > 1) {
                    throw new Error('Аргумент арксинуса должен быть в диапазоне [-1, 1]');
                }
                return Math.asin(x);
            },
            'cos-1': (x) => {
                if (x < -1 || x > 1) {
                    throw new Error('Аргумент арккосинуса должен быть в диапазоне [-1, 1]');
                }
                return Math.acos(x);
            },
            'tan-1': Math.atan,
            'sinh-1': Math.asinh,
            'cosh-1': (x) => {
                if (x < 1) {
                    throw new Error('Аргумент арккосинуса должен быть >= 1');
                }
                return Math.acosh(x);
            },
            'tanh-1': (x) => {
                if (x <= -1 || x >= 1) {
                    throw new Error('Аргумент арктангенса должен быть в диапазоне (-1, 1)');
                }
                return Math.atanh(x);
            }
        };
    }

    parseExpression(expression) {
        expression = this.preprocessExpression(expression);
        let processedExpression = this.parseTrigFunc(expression);

        for (const [func, implementation] of Object.entries(this.trigFunctions)) {
            const regex = new RegExp(`${func}\\s*\\(([^)]+)\\)`, 'g');
            processedExpression = processedExpression.replace(regex, (match, arg) => {
                const value = this.evaluateArgument(arg);
                try {
                    return implementation(value);
                } catch (error) {
                    throw error;
                }
            });
        }

        for (const [func, implementation] of Object.entries(this.inverseTrigFunctions)) {
            const regex = new RegExp(`${func}\\s*\\(([^)]+)\\)`, 'g');
            processedExpression = processedExpression.replace(regex, (match, arg) => {
                const value = this.evaluateArgument(arg);
                try {
                    return implementation(value);
                } catch (error) {
                    throw error;
                }
            });
        }

        return processedExpression;
    }

    preprocessExpression(expression) {
        return expression.replace(/\s+/g, ' ').trim();
    }

    parseTrigFunc(expression) {
        if (expression.includes('<span class="trig-func"')) {
            return this.parseHtmlTrigFunc(expression);
        } else {
            return this.parseTextTrigFunc(expression);
        }
    }

    parseHtmlTrigFunc(expression) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = expression;
        
        const trigElements = tempDiv.querySelectorAll('.trig-func');
        let result = expression;

        trigElements.forEach(element => {
            const funcName = element.querySelector('.trig-name')?.textContent.trim().toLowerCase();
            const content = element.querySelector('.trig-content')?.textContent.trim();

            if (funcName && content) {
                let replacement = '';
                
                if (funcName.endsWith('_inv')) {
                    if (this.inverseTrigFunctions[funcName]) {
                        replacement = `${funcName}(${content})`;
                    }
                } else if (this.trigFunctions[funcName]) {
                    replacement = `${funcName}(${content})`;
                }

                if (replacement) {
                    result = result.replace(element.outerHTML, replacement);
                }
            }
        });

        return result;
    }

    parseTextTrigFunc(expression) {
        let result = expression;

        for (const [func, implementation] of Object.entries(this.inverseTrigFunctions)) {
            const regex = new RegExp(`${func}\\s*\\(([^)]+)\\)`, 'g');
            result = result.replace(regex, (match, arg) => {
                return `${func}(${arg})`;
            });
        }

        for (const [func, implementation] of Object.entries(this.trigFunctions)) {
            const regex = new RegExp(`${func}\\s*\\(([^)]+)\\)`, 'g');
            result = result.replace(regex, (match, arg) => {
                return `${func}(${arg})`;
            });
        }

        return result;
    }

    evaluateArgument(arg) {
        arg = arg.trim();
        
        if (arg === 'π' || arg === 'pi') {
            return this.PI;
        }

        if (arg.endsWith('°')) {
            const degrees = parseFloat(arg.slice(0, -1));
            return (degrees * this.PI) / 180;
        }

        if (arg.endsWith('rad')) {
            return parseFloat(arg.slice(0, -3));
        }

        return parseFloat(arg);
    }

    isTrigFunction(str) {
        return Object.keys(this.trigFunctions).some(func => str.includes(func)) ||
               Object.keys(this.inverseTrigFunctions).some(func => str.includes(func));
    }
} 