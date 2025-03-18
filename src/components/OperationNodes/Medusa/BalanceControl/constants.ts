export const DEFAULT_VALUES = {
  targetWeight: 0,
  currentWeight: 0,
  tolerance: 0.001,
  unit: 'g',
  isStable: false,
  tare: false
};

export const BALANCE_SPECS = {
  model: 'Mettler Toledo XPE205',
  manufacturer: 'Mettler Toledo',
  type: 'Analytical Balance',
  capacity: '220g',
  readability: '0.01mg',
  repeatability: '0.02mg',
  stabilizationTime: '2s'
};

export const WEIGHT_LIMITS = {
  min: 0,
  max: 220
};
