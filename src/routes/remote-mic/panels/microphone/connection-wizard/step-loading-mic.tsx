import Loader from '~/modules/elements/loader';

// Purely presentational — ConnectionWizard holds off requesting mic permission for a beat so this
// has time to show before the browser's permission prompt can interrupt it.
export default function StepLoadingMic() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2 text-center">
      <Loader size="2em" />
    </div>
  );
}
