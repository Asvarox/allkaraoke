import { ComponentProps } from 'react';
import { twc } from 'react-twc';

export const Heading = twc.h1`relative flex items-center justify-center`;

// From https://codepen.io/haniotis/pen/KwvYLO
const SCompletedAnim = twc.svg`mr-2.5 block h-[35px] w-[35px] animate-[fill_0.4s_ease-in-out_0.4s_forwards,scale_0.3s_ease-in-out_0.9s_both] rounded-full stroke-white stroke-2 [box-shadow:inset_0px_0px_0px_var(--green)] [--curve:cubic-bezier(0.65,0,0.45,1)] [--green:#4caf50] [stroke-miterlimit:10] [&_.checkmark__check]:origin-center [&_.checkmark__check]:animate-[stroke_0.3s_var(--curve)_0.8s_forwards] [&_.checkmark__check]:[stroke-dasharray:48] [&_.checkmark__check]:[stroke-dashoffset:48] [&_.checkmark__circle]:animate-[stroke_0.6s_var(--curve)_forwards] [&_.checkmark__circle]:fill-none [&_.checkmark__circle]:stroke-[var(--green)] [&_.checkmark__circle]:stroke-2 [&_.checkmark__circle]:[stroke-dasharray:166] [&_.checkmark__circle]:[stroke-dashoffset:166] [&_.checkmark__circle]:[stroke-miterlimit:10]`;

export const CompletedAnim = (props: ComponentProps<typeof SCompletedAnim>) => (
  <SCompletedAnim {...props}>
    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
      <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
    </svg>
  </SCompletedAnim>
);
