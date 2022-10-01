const spreadValue = (initial: number, spread: number) => initial - spread + Math.random() * spread * 2;

export default spreadValue;

export const randomSign = () => Math.sign(Math.random() - 0.5);
