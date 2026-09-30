export type QuestionType = "SINGLE" | "MULTI";

export type ExamMode = "COMMON" | "SPECIAL";

export interface Question {
  _id?: string;
  question: string;
  options: string[];
  questionType: QuestionType;
  answer: string[];
}

export interface QuestionSet {
  _id: string;
  questionSetName: string;
  department: string;
  questions: Question[];
  createdBy: string;
  isActive: boolean;
}

export interface Student {
  _id: string;
  name: string;
  email: string;
  department: string;
}

export interface Exam {
  _id: string;
  title: string;
  description: string;
  questionSetIds: string[];
  questionIds: string[];
  department: string;
  instructorId: string;
  durationMinutes: number;
  questionCount: number;
  marksPerQuestion: number;
  negativeMarking: {
    enabled: boolean;
    penalty: number;
  };
  mode: ExamMode;
  maxAttempts: number;
  startDate?: string | null;
  deadlineDate?: string | null;
  strictExam?: {
    _id: string;
    examId: string;
    questionSetIds: string[];
    attemptChances: number;
    deadlineDate: string;
    instructorId: string;
    durationMinutes: number;
  } | null;
  status: "UNPUBLISHED" | "PUBLISHED" | "EXPIRED" | "CLOSED";
  selectedStudents?: Student[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR";
  department?: string | null;
}
