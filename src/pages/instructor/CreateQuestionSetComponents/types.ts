export type QuestionType = "SINGLE" | "MULTI";

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

export interface LoggedInUser {
  _id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR";
  department?: string | null;
}
