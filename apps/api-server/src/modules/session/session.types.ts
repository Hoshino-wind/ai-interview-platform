import { SessionStatus } from '@shared/shared-types';

export interface SessionTimelineEvent {
  type: 'session_created' | 'consent_recorded' | 'submission_created' | 'evaluation_queued' | 'evaluation_completed';
  timestamp: Date;
  label: string;
  details?: Record<string, unknown>;
}

export const ALLOWED_SESSION_TRANSITIONS: Record<SessionStatus, SessionStatus[]> = {
  [SessionStatus.DRAFT]: [SessionStatus.PENDING_CONSENT],
  [SessionStatus.PENDING_CONSENT]: [SessionStatus.IN_PROGRESS],
  [SessionStatus.IN_PROGRESS]: [SessionStatus.EVALUATING, SessionStatus.REVIEWING],
  [SessionStatus.EVALUATING]: [SessionStatus.REVIEWING, SessionStatus.EVALUATION_FAILED, SessionStatus.MANUAL_HOLD],
  [SessionStatus.REVIEWING]: [SessionStatus.DECIDED, SessionStatus.MANUAL_HOLD],
  [SessionStatus.DECIDED]: [SessionStatus.ARCHIVED],
  [SessionStatus.ARCHIVED]: [],
  [SessionStatus.EVALUATION_FAILED]: [SessionStatus.EVALUATING, SessionStatus.MANUAL_HOLD],
  [SessionStatus.MANUAL_HOLD]: [SessionStatus.EVALUATING, SessionStatus.REVIEWING, SessionStatus.DECIDED],
};
