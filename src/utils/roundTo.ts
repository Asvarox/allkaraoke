export const roundTo = (num: number, precision: number) => {
  if (num === 0) return 0;

  const multiplier = Math.pow(10, precision);

  return Math.round(num * multiplier) / multiplier;
};
