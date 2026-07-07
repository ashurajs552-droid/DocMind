import * as pdfjs from 'pdfjs-dist';

console.log('PDFJS object keys:', Object.keys(pdfjs));
console.log('getDocument function exists:', typeof pdfjs.getDocument === 'function');
