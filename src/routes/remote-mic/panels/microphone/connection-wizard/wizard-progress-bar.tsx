interface Props {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

export default function WizardProgressBar({ currentStep, totalSteps, stepLabel }: Props) {
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div>
      <div className="h-1 w-full rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-white/70">{stepLabel}</p>
    </div>
  );
}
