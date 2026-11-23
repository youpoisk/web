import {buildExtension} from './build-extension.mjs';
console.log(`Chrome extension built at ${await buildExtension('chrome')}`);
