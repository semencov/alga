const Alga = (date = new Date(), opts = {}) => {
  if (!(date instanceof Date)) {
    throw new Error('Can not recognize date format');
  }

  let alga = {
    netto: 0,
    brutto: 0
  };

  return new Proxy(alga, {
    get(obj, prop) {
      console.log('- get:', prop.toString());
    },
    set(obj, prop, value) {
      console.log('- set:', prop, value);
    },
  });
};

let a = Alga();

console.log(a);
console.log(a.netto);
console.log(a.netto());

