export function createTrigTemplate(name, isInverse = false, isHyperbolic = false) {
  let display = name;
  if (isHyperbolic) display += 'h';
  if (isInverse) display += '<sup>-1</sup>';
  const span = document.createElement('span');
  span.className = 'trig-func';
  span.innerHTML = `
  ${display}<span class="trig-paren">(</span><span class="trig-content" contenteditable="true"></span><span class="trig-paren">)</span>`;
  return span;
}
