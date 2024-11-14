export interface SubmissionRequest {
    companyId: string;
    roleType: RoleType;
    platform: Platform;
    score?: number;
    questionsCount?: number;
    testCases?: Record<string, boolean>;
    status: SubmissionStatus;
    assessmentReceived?: string;
    assessmentTaken?: string;
    responseReceived?: string;
    comments?: string;
  }