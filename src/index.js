import taxRates from "./rates.json";

const _private = new WeakMap();

export default class Alga {

  static INVALID_STATUS_NONE = 0;
  static INVALID_STATUS_CAT_I = 1;
  static INVALID_STATUS_CAT_II = 1;
  static INVALID_STATUS_CAT_III = 2;

  static PENSION_STATUS_NONE = 0;
  static PENSION_STATUS_BY_AGE = 1;
  static PENSION_STATUS_BY_SERVICE = 2;

  static MODE_BRUTTO = 1;
  static MODE_NETTO = 2;

  constructor (date = new Date(), opts = {}) {
    if (!(date instanceof Date)) {
      throw new Error("Can not recognize date format");
    }

    const [dateSearch] = date.toISOString().split('T');
    const taxPeriods = Object.keys(taxRates);
    const index = _sortedIndex(taxPeriods, dateSearch);

    if (index === 0) {
      throw new Error("Library does not support dates before 2010-01-01");
    }

    const period = taxPeriods[index - 1];

    _private.set(this, {
      rates: taxRates[period],
      options: _extend({
        dependents: 0,
        pensionStatus: Alga.PENSION_STATUS_NONE,
        invalidStatus: Alga.INVALID_STATUS_NONE,
        victimStatus: false,
        hasTaxBook: true,
        hasContract: true
      }, opts),

      netto: 0,
      brutto: 0,
      mode: Alga.MODE_BRUTTO,

      iin: 0,
      vsaoi: {employee: 0, employer: 0},
      taxes: 0,
      benefits: {dependents: 0, extra: 0},
      total: 0,
      exemptionLimit: 0
    });
  }

  _calc (values = {}) {
    const rates = this.rates;
    let data = _extend(_private.get(this), values);

    data.benefits.dependents = data.options.hasTaxBook
      ? _round(data.options.dependents * rates.dependentBenefit)
      : 0;

    data.benefits.extra = (data.options.hasTaxBook && data.options.victimStatus)
      ? Math.max(_round(rates.invalidBenefit), rates.victimBenefit)
      : _round(rates.invalidBenefit);

    if (data.mode === Alga.MODE_NETTO) {
      const IIN = rates.incomeTaxRate / 100;
      const SOC = rates.socialTaxRate / 100;
      const extraCoefficient = 1 - SOC - IIN + SOC * IIN;
      const benefit = rates.exemptionLimit + data.benefits.dependents + data.benefits.extra;

      data.brutto = _round(Math.max(0, data.netto - Math.min(data.netto, benefit) * IIN) / extraCoefficient);
    }

    data.vsaoi.employer = _round((data.brutto / 100) * rates.employerTaxRate);
    data.vsaoi.employee = _round((data.brutto / 100) * rates.socialTaxRate);

    data.iin = data.brutto - data.vsaoi.employee - rates.exemptionLimit - data.benefits.dependents - data.benefits.extra;
    data.iin = Math.max(data.iin * rates.incomeTaxRate, 0);
    data.iin = Math.round(data.iin) / 100;

    data.taxes = _round(rates.riskFee + data.iin + data.vsaoi.employer + data.vsaoi.employee);
    data.total = _round(rates.riskFee + data.brutto + data.vsaoi.employer);

    if (data.mode === Alga.MODE_BRUTTO) {
      data.netto = data.brutto - data.vsaoi.employee - data.iin;
    }

    if (data.mode === Alga.MODE_NETTO) {
      data.brutto = _round(data.netto + data.iin + data.vsaoi.employee);
    }

    _private.set(this, data);
  }

  get brutto () {
    return _private.get(this).brutto;
  }

  set brutto (value) {
    value = parseFloat(value);

    let data = {
      brutto: _round(value),
      mode: Alga.MODE_BRUTTO
    };

    this._calc(data);
  }

  get netto () {
    return _private.get(this).netto;
  }

  set netto (value) {
    value = parseFloat(value);

    let data = {
      netto: _round(value),
      mode: Alga.MODE_NETTO
    };

    this._calc(data);
  }

  get dependents () {
    return _private.get(this).options.dependents;
  }

  set dependents (value) {
    value = parseInt(value);

    let data = {
      options: {
        dependents: Math.max(0, value)
      }
    };

    this._calc(data);
  }

  get pensionStatus () {
    return _private.get(this).options.pensionStatus;
  }

  set pensionStatus (value) {
    if (value in [Alga.PENSION_STATUS_NONE, Alga.PENSION_STATUS_BY_AGE, Alga.PENSION_STATUS_BY_SERVICE]) {
      let data = {
        options: {
          pensionStatus: value
        }
      }

      this._calc(data);
    }
  }

  get invalidStatus () {
    return _private.get(this).options.invalidStatus;
  }

  set invalidStatus (value) {
    if (value in [Alga.INVALID_STATUS_NONE, Alga.INVALID_STATUS_CAT_I, Alga.INVALID_STATUS_CAT_II, Alga.INVALID_STATUS_CAT_III]) {
      let data = {
        options: {
          invalidStatus: value
        }
      };

      this._calc(data);
    }
  }

  get victimStatus () {
    return _private.get(this).options.victimStatus;
  }

  set victimStatus (value) {
    let data = {
      options: {
        victimStatus: !!value
      }
    };

    this._calc(data);
  }

  get hasTaxbook () {
    return _private.get(this).options.hasTaxBook;
  }

  set hasTaxbook (value) {
    let data = {
      options: {
        hasTaxBook: !!value
      }
    };

    this._calc(data);
  }

  get hasContract () {
    return _private.get(this).options.hasContract;
  }

  set hasContract (value) {
    let data = {
      options: {
        hasContract: !!value
      }
    };

    this._calc(data);
  }

  get total () {
    return _private.get(this).total;
  }

  get taxes () {
    return _private.get(this).taxes;
  }

  get iin () {
    return _private.get(this).iin;
  }

  get vsaoi () {
    return _private.get(this).vsaoi;
  }

  get benefits () {
    return _private.get(this).benefits;
  }

  get rates () {
    let data = _private.get(this);

    return {
      incomeTaxRate: data.rates.incomeTaxRate,
      riskFee: data.rates.riskFee,
      socialTaxRate: data.rates.socialTaxRates[data.options.pensionStatus],
      employerTaxRate: data.rates.employerTaxRates[data.options.pensionStatus],
      exemptionLimit: (data.options.hasTaxBook && !(data.options.invalidStatus || data.options.pensionStatus)) ? data.rates.exemptionLimit : 0,
      dependentBenefit: data.options.hasTaxBook ? data.rates.dependentBenefit : 0,
      invalidBenefit: data.rates.invalidBenefit[data.options.invalidStatus],
      victimBenefit: data.options.victimStatus && data.options.hasTaxBook ? data.rates.victimBenefit : 0
    }
  }
}

function _extend (target, ...sources) {
  const merge = obj => {
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          target[prop] = _extend(target[prop], obj[prop]);
        } else {
          target[prop] = obj[prop];
        }
      }
    }
  };

  for (let i in sources) {
    merge(sources[i]);
  }

  return target;
}

function _convert (amount, currency = 'LVL') {
  let ratio = 0.702804;  // Official LVL to EUR ratio
  return currency === 'LVL' ? (amount / ratio) : (amount * ratio);
}

function _round (num) {
  return parseFloat(num.toFixed(2));
}

function _sortedIndex (haystack = [], needle) {
  if (typeof haystack !== 'object')
    throw new Error("Haystack must be an Object");

  let arr = !Array.isArray(haystack) ? Object.keys(haystack) : haystack;
  arr.push(needle);
  arr.sort();

  return arr.indexOf(needle);
}

