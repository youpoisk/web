import {buildExtension} from './build-extension.mjs';
console.log(`Firefox extension built at ${await buildExtension('firefox')}`);
