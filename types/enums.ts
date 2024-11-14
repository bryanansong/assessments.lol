export const ROLE_TYPES = ['INTERNSHIP', 'NEW_GRAD', 'FULL_TIME'] as const;
export const PLATFORMS = ['CODESIGNAL', 'HACKERRANK'] as const;
export const SUBMISSION_STATUSES = [
    'PENDING',
    'REJECTED',
    'MOVED_FORWARD',
    'AWAITING_RESPONSE'
  ] as const;

export type RoleType = typeof ROLE_TYPES[number];
export type Platform = typeof PLATFORMS[number];
export type SubmissionStatus = typeof SUBMISSION_STATUSES[number];