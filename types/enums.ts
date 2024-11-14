const ROLE_TYPES = ['INTERNSHIP', 'NEW_GRAD', 'FULL_TIME'] as const;
const PLATFORMS = ['CODESIGNAL', 'HACKERRANK'] as const;

type RoleType = typeof ROLE_TYPES[number];
type Platform = typeof PLATFORMS[number];