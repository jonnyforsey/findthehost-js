console.log('✅ property-page.js loaded and running');

document.body.style.backgroundColor = 'lightblue';

const testBanner = document.createElement('div');
testBanner.textContent = 'JS from GitHub is working!';
testBanner.style.position = 'fixed';
testBanner.style.top = '0';
testBanner.style.left = '0';
testBanner.style.width = '100%';
testBanner.style.padding = '10px';
testBanner.style.background = 'green';
testBanner.style.color = 'white';
testBanner.style.textAlign = 'center';
testBanner.style.zIndex = '9999';

document.body.appendChild(testBanner);
