const spreadValue = (initial: number, spread: number) => initial - spread + Math.random() * spread * 2;

export default spreadValue;

export const randomSign = (weight = 0) => Math.sign(weight + Math.random() - 0.5);
