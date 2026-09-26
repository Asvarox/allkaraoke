import { useEffect, useState } from 'react';

import { Input } from '~/modules/elements/input';

// Long enough to be noticed, short enough that the button is back to "Copy" before anyone tries again
const COPIED_LABEL_TIMEOUT_MS = 2_000;

interface Props {
  link: string;
  inputDataTest?: string;
  buttonDataTest?: string;
}

/** A read-only link with the button that copies it embedded in the field — the invite affordance shared by the online
 * lobby and the remote-mic connection screen. */
export default function CopyLinkField({ link, inputDataTest, buttonDataTest }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), COPIED_LABEL_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copyLink = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(link)
      .then(() => setCopied(true))
      .catch(() => {
        // Clipboard write was rejected (e.g. missing permission) — leave the button as "Copy".
      });
  };

  return (
    <Input
      focused={false}
      label=""
      aria-label="Invite link"
      value={link}
      onChange={() => undefined}
      readOnly
      className="w-full"
      data-test={inputDataTest}
      adornment={
        <Input.Button onClick={copyLink} data-test={buttonDataTest}>
          {copied ? 'Copied' : 'Copy'}
        </Input.Button>
      }
    />
  );
}
