export type ExamStatus =
  | "UNPUBLISHED"
  | "PUBLISHED"
  | "EXPIRED"
  | "CLOSED";

export type ExamMode =
  | "COMMON"
  | "SPECIAL";

export type ExamType =
  | "NORMAL"
  | "STRICT";

export type AttemptStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "AUTO_SUBMITTED";

export type DashboardExam = {
  _id: string;

  title: string;

  description?: string;

  department?: string;

  mode: ExamMode;

  durationMinutes: number;

  questionCount: number;

  marksPerQuestion: number;

  negativeMarking?: {
    enabled?: boolean;
    penalty?: number;
  };

  status: ExamStatus;

  startDate?: string | null;

  deadlineDate?: string | null;

  examType?: ExamType;

  type?: ExamType;

  strict?: boolean;

  strictDeadlineDate?: string | null;

  strictExamDeadline?: string | null;

  maxAttempts?: number;

  attemptsUsed?: number;

  remainingAttempts?: number;
};

export type DashboardAttempt = {
  _id: string;

  examId: string;

  examName: string;

  examDepartment?: string;

  department?: string;

  mode: ExamMode;

  attemptNo: number;

  startTime: string;

  submittedAt?: string | null;

  status: AttemptStatus;

  score?: number | null;

  totalMarks?: number | null;

  correctAnswers?: number;

  wrongAnswers?: number;

  unanswered?: number;

  timeTakenSeconds?: number;

  examStatus?: ExamStatus;

  resultAvailable?: boolean;

  examType?: ExamType;

  type?: ExamType;

  strict?: boolean;
};

export type DashboardStatistics = {
  availableExams: number;

  completedExams: number;

  missedExams: number;

  pendingExams: number;
};

export type StudentDashboardResponse = {
  success: boolean;

  message?: string;

  student?: {
    _id: string;

    name: string;

    email: string;

    department?: string | null;
  };

  statistics?: DashboardStatistics;

  /*
    This is returned by the backend
    outside the statistics object.
  */
  averageScore?: {
    percentage: number;

    score: number;

    totalMarks: number;

    examsCounted: number;
  };

  availableExams?: DashboardExam[];

  recentAttempts?: DashboardAttempt[];
};