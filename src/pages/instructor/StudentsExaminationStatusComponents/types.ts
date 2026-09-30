export type ExamMode =
  | "COMMON"
  | "SPECIAL";

export type AttemptStatus =
  | "NOT_ATTEMPTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "AUTO_SUBMITTED";

export type StatusTab =
  | "UNATTEMPTED"
  | "SPECIAL"
  | "COMMON";

export interface StatusStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;

  examId: string;
  examName: string;
  examMode: ExamMode;

  attemptId?: string;
  attemptNo?: number;

  status: AttemptStatus;

  questionCount: number;
  answeredCount: number;

  totalMarks: number;
  securedMarks: number;
  percentage: number;

  startTime?: string;
  submittedAt?: string | null;

  timeTakenSeconds: number;
}

export interface ExaminationStatusData {
  incomplete: StatusStudent[];
  privateResults: StatusStudent[];
  commonResults: StatusStudent[];
}

export interface AttemptQuestion {
  questionId: string;
  question: string;
  options: string[];

  questionType:
    | "SINGLE"
    | "MULTI";

  selectedAnswers: string[];
  correctAnswers: string[];

  isCorrect: boolean;
  marksAwarded: number;
}

export interface AttemptDetails {
  attemptId: string;

  student: {
    id: string;
    name: string;
    email: string;
    department: string;
  };

  exam: {
    id: string;
    name: string;
    mode: ExamMode;
    department: string;

    durationMinutes: number;
    questionCount: number;
    marksPerQuestion: number;

    negativeMarking: {
      enabled: boolean;
      penalty: number;
    };
  };

  attempt: {
    attemptNo: number;
    startTime: string;
    submittedAt?: string | null;

    status:
      | "IN_PROGRESS"
      | "SUBMITTED"
      | "AUTO_SUBMITTED";

    timeTakenSeconds: number;

    totalMarks: number;
    securedMarks: number;
    percentage: number;

    answeredCount: number;
    correctAnswers: number;
    wrongAnswers: number;
    unanswered: number;
  };

  questions: AttemptQuestion[];
}