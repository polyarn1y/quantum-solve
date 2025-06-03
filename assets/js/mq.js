import { inputField } from "./constants.js";

const MQ = MathQuill.getInterface(2);

export const mathField = MQ.MathField(inputField, {
    spaceBehavesLikeTab: false,
    handlers: {
        edit: function(field) {
            updatePlaceholderVisibility();
            replaceMultiplicationDotWithAsterisk();
            insertCustomFractionLines();
            updateFractionLineMargins();
            checkPowerPartFocus();  
            checkFractionPartFocus(); 
        },
        select: function(field) {
            checkPowerPartFocus();
            checkFractionPartFocus();
        },
        moveOut: function(field) {
            checkPowerPartFocus();
            checkFractionPartFocus();
        }
    }
    
});

function hasRealContent(element) {
    if (!element) return false;

    const textNodes = Array.from(element.childNodes).filter(node =>
        node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0
    );
    if (textNodes.length > 0) return true;

    const childElements = Array.from(element.querySelectorAll('*'));
    for (const el of childElements) {
        const text = el.textContent.trim();
        const hasVisibleText = text.length > 0;

        if (
            el.classList.contains('mq-cursor') ||
            el.classList.contains('mq-blink') ||
            el.classList.contains('mq-hasCursor')
        ) continue;

        if (hasVisibleText) return true;
    }

    return false;
}

export function checkPowerPartFocus() {
    const powerElements = mathField.el().querySelectorAll('.mq-sup');

    powerElements.forEach(powerEl => {
        const hasContent = hasRealContent(powerEl);
        powerEl.classList.toggle('mq-hasContent', hasContent);
        const cursor = mathField.el().querySelector('.mq-cursor');
        const hasCursor = cursor && powerEl.contains(cursor);
        if (!hasContent && hasCursor) {
            powerEl.classList.add('mq-power-part-focus');
        } else {
            powerEl.classList.remove('mq-power-part-focus');
        }
    });
}

export function checkFractionPartFocus() {
    const numerators = mathField.el().querySelectorAll('.mq-numerator');
    const denominators = mathField.el().querySelectorAll('.mq-denominator');

    numerators.forEach(numerator => {
        console.log('numerator');
        numerator.classList.toggle('mq-fraction-part-focus', !hasRealContent(numerator));
    });

    denominators.forEach(denominator => {
        denominator.classList.toggle('mq-fraction-part-focus', !hasRealContent(denominator));
    });
}

function updatePlaceholderVisibility() {
const hasContentMQ = mathField.latex().trim().length > 0;
let placeholderMQ = document.querySelector(".main__input-placeholder");
    if (placeholderMQ) {
        placeholderMQ.style.display = (hasContentMQ) ? 'none' : 'block';
    }
}

function replaceMultiplicationDotWithAsterisk() {
    const mathFieldElement = mathField.el();
    if (mathFieldElement) {
        const operators = mathFieldElement.querySelectorAll('.mq-binary-operator');
        operators.forEach(op => {
            if (op.childNodes.length === 1 && op.firstChild.nodeType === Node.TEXT_NODE && op.firstChild.nodeValue.trim() === '·') {
                op.firstChild.nodeValue = '*';
            }
        });
    }
}

function insertCustomFractionLines() {
    const mathFieldElement = mathField.el();
    if (!mathFieldElement) return;
    const fractions = mathFieldElement.querySelectorAll('.mq-fraction');
    fractions.forEach(fraction => {
        if (fraction.querySelector('.mq-fraction-line')) return;
        const lineSpan = document.createElement('span');
        lineSpan.className = 'mq-fraction-line';
        const numerator = fraction.querySelector('.mq-numerator');
        const denominator = fraction.querySelector('.mq-denominator');
        numerator.classList.add('mq-fraction-part-focus');
        denominator.classList.add('mq-fraction-part-focus');
        if (numerator && denominator) {
            fraction.insertBefore(lineSpan, denominator);
        }
    });
}

function updateFractionLineMargins(root = mathField.el()) {
    const fractions = root.querySelectorAll('.mq-fraction');
    const contentMargin = '0px';
    const defaultCssMargin = '2px';

    fractions.forEach(fraction => {
        const numerator = fraction.querySelector('.mq-numerator');
        const denominator = fraction.querySelector('.mq-denominator');
        const line = fraction.querySelector('.mq-fraction-line');
        if (!line) return;
        
        if (hasRealContent(numerator)) {
            line.style.marginTop = contentMargin;
            updateFractionLineMargins(numerator);
        } else {
            line.style.marginTop = defaultCssMargin;
        }

        if (hasRealContent(denominator)) {
            line.style.marginBottom = "2px";
            updateFractionLineMargins(denominator);
        } else {
            line.style.marginBottom = defaultCssMargin;
        }
    });
}
