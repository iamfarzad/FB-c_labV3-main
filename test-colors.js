// Test script to check CSS variables and actual colors
console.log('=== CSS Variables Check ===');

// Get the root element
const root = document.documentElement;

// Function to get CSS variable value
function getCSSVar(name) {
  return getComputedStyle(root).getPropertyValue(name).trim();
}

// Function to convert HSL to hex for comparison
function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Check brand colors
const brandColors = [
  '--accent',
  '--primary',
  '--background',
  '--foreground',
  '--color-orange-accent',
  '--color-gunmetal',
  '--color-light-silver'
];

console.log('Brand Colors:');
brandColors.forEach(colorVar => {
  const value = getCSSVar(colorVar);
  console.log(`${colorVar}: ${value}`);

  // If it's HSL, convert to hex for comparison
  if (value.includes('%')) {
    const hsl = value.split(' ').map(v => parseFloat(v));
    if (hsl.length === 3) {
      const hex = hslToHex(hsl[0], hsl[1], hsl[2]);
      console.log(`  → Hex: ${hex}`);
    }
  }
});

// Check if dark mode is active
const isDark = document.body.classList.contains('dark');
console.log(`\nCurrent theme: ${isDark ? 'dark' : 'light'}`);

// Check some actual element colors
console.log('\n=== Element Colors ===');
const testElements = [
  { selector: 'body', description: 'Body background' },
  { selector: 'h1, h2, h3', description: 'Headings' },
  { selector: 'button', description: 'Buttons' },
  { selector: '.bg-accent', description: 'Accent elements' }
];

testElements.forEach(({ selector, description }) => {
  const element = document.querySelector(selector);
  if (element) {
    const bgColor = getComputedStyle(element).backgroundColor;
    const textColor = getComputedStyle(element).color;
    console.log(`${description}:`);
    console.log(`  Background: ${bgColor}`);
    console.log(`  Text: ${textColor}`);
  }
});
