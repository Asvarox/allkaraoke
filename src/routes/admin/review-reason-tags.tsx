import { ComponentProps } from 'react';

import { Chip } from '~/modules/elements/akui/chip';

import { AdminReviewReason, AdminReviewSong, describeDurationShift } from './unverified-songs-admin-api';

const reasonLabels: Record<AdminReviewReason, string> = {
  unverified: 'Unverified',
  'not-in-sync': 'Not in sync',
  'too-loud': 'Too loud',
  'too-quiet': 'Too quiet',
  'duration-shift': 'Duration shift',
};

const reasonVariants: Record<AdminReviewReason, ComponentProps<typeof Chip>['variant']> = {
  unverified: 'info',
  'not-in-sync': 'danger',
  'too-loud': 'warning',
  'too-quiet': 'warning',
  'duration-shift': 'danger',
};

interface Props {
  song: Pick<AdminReviewSong, 'reasons' | 'reportCounts' | 'durationShift'>;
}

export function ReviewReasonTags({ song }: Props) {
  return (
    <span className="inline-flex flex-wrap gap-1" data-test="admin-review-reasons">
      {song.reasons.map((reason) => {
        const reportCount = reason === 'unverified' ? undefined : song.reportCounts?.[reason];
        const title =
          reason === 'duration-shift' && song.durationShift
            ? describeDurationShift(song.durationShift)
            : reportCount
              ? `${reportCount} player reports`
              : undefined;

        return (
          <Chip
            key={reason}
            variant={reasonVariants[reason]}
            data-test="admin-review-reason"
            data-reason={reason}
            title={title}>
            {reasonLabels[reason]}
            {reportCount ? ` (${reportCount})` : ''}
          </Chip>
        );
      })}
    </span>
  );
}
