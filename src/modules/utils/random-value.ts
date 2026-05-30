export const randomFloat = (from: number, to: number) => {
  return from + Math.random() * (to - from);
};

export const randomInt = (from: number, to: number) => Math.round(randomFloat(from, to));
