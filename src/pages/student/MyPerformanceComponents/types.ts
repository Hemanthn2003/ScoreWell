export type ExamStatus = "UNPUBLISHED" | "PUBLISHED" | "EXPIRED" | "CLOSED";

export type ExamType = "COMMON" | "SPECIAL";

export type ExamMode = "NORMAL" | "STRICT";

export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED";

export type QuestionType = "SINGLE" | "MULTI";

export interface PerformanceQuestion {
  questionId: string;
  question: string;
  options: string[];

  questionType: QuestionType;

  selectedAnswers: string[];
  correctAnswers: string[];

  isCorrect: boolean;
  marksAwarded: number;
}

export interface PerformanceExam {
  id: string;
  title: string;
  description: string;
  department: string;

  durationMinutes: number;
  questionCount: number;
  marksPerQuestion: number;

  negativeMarking: {
    enabled: boolean;
    penalty: number;
  };

  mode: "COMMON" | "SPECIAL";

  status: ExamStatus;

  startDate: string | null;
  deadlineDate: string | null;

  examType: ExamType;
  examMode: ExamMode;

  strictDeadlineDate: string | null;
  strictAttemptChances: number | null;
}

export interface PerformanceAttempt {
  _id: string;

  examId: string;
  examName: string;

  exam: PerformanceExam;

  attempt: {
    attemptNo: number;

    startTime: string;
    submittedAt: string | null;

    status: AttemptStatus;

    score: number;
    totalMarks: number;

    correctAnswers: number;
    wrongAnswers: number;
    unanswered: number;

    timeTakenSeconds: number;
    percentage: number;

    questions: PerformanceQuestion[];
  };

  resultReleaseDate: string | null;
}

export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface PerformanceOverview {
  totalExams: number;
  totalAttempts: number;

  averagePercentage: number;

  totalScore: number;
  totalMarks: number;

  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;

  completedExams: number;

  commonExams: number;
  specialExams: number;
  strictExams: number;
}

export interface StudentPerformanceResponse {
  success: boolean;

  student: StudentInfo;

  overview: PerformanceOverview;

  examResults: PerformanceAttempt[];
  upcomingResults: PerformanceAttempt[];
}
