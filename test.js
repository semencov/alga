const Alga = require('./alga.js');

let alga1 = new Alga();
let alga2 = new Alga(new Date('2014-05-01'));

console.log('alga1.brutto = 500');
alga1.brutto = 500;
console.log('-- alga1.netto ==', alga1.netto);
console.log('-- alga1.brutto ==', alga1.brutto);
console.log('-- alga1.iin ==', alga1.iin);
console.log('-- alga1.vsaoi ==', alga1.vsaoi);
console.log('-- alga1.taxes ==', alga1.taxes);
console.log('-- alga1.total ==', alga1.total);
console.log('-- alga1.benefits ==', alga1.benefits);
console.log('-- alga1.rates ==', alga1.rates);
console.log();

console.log('alga2.brutto = 500');
alga2.brutto = 500;
console.log('-- alga2.netto ==', alga2.netto);
console.log('-- alga2.brutto ==', alga2.brutto);
console.log('-- alga2.iin ==', alga2.iin);
console.log('-- alga2.vsaoi ==', alga2.vsaoi);
console.log('-- alga2.taxes ==', alga2.taxes);
console.log('-- alga2.total ==', alga2.total);
console.log('-- alga2.benefits ==', alga2.benefits);
console.log('-- alga2.rates ==', alga2.rates);
console.log();

