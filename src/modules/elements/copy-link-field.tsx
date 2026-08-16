import { useEffect, useState } from 'react';

// Long enough to be noticed, short enough that the button is back to "Copy" before anyone tries again
const COPIED_LABEL_TIMEOUT_MS = 2_000;

interface Props {
  link: string;
  inputDataTest?: string;
  buttonDataTest?: string;
}

/** A read-only link next to the button that copies it — the invite affordance shared by the online
 * lobby and the remote-mic connection screen. */
export default function CopyLinkField({ link, inputDataTest, buttonDataTest }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), COPIED_LABEL_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copyLink = () => {
    void navigator.clipboard?.writeText(link);
    setCopied(true);
  };

  return (
    <div className="flex w-full items-stretch">
      <input
        className="box-border w-full border-none bg-gray-600 p-3 text-sm text-white"
        disabled
        value={link}
        data-test={inputDataTest}
      />
      <button
        className="bg-active typography text-md box-border cursor-pointer border-0 px-5 font-bold active:bg-black"
        onClick={copyLink}
        data-test={buttonDataTest}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
