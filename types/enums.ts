const ROLE_TYPES = ['INTERNSHIP', 'NEW_GRAD', 'FULL_TIME'] as const;
const PLATFORMS = ['CODESIGNAL', 'HACKERRANK'] as const;
const SUBMISSION_STATUSES = [
    'PENDING',
    'REJECTED',
    'MOVED_FORWARD',
    'AWAITING_RESPONSE'
  ] as const;

type RoleType = typeof ROLE_TYPES[number];
type Platform = typeof PLATFORMS[number];
type SubmissionStatus = typeof SUBMISSION_STATUSES[number];