import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export type AttemptStatus =
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "AUTO_SUBMITTED";

export type AttemptQuestionType =
  | "SINGLE"
  | "MULTI";

export type AttemptMode =
  | "COMMON"
  | "SPECIAL";

export interface IAttemptQuestion {
  questionId: string;
  question: string;
  options: string[];
  questionType: AttemptQuestionType;
  selectedAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
  marksAwarded: number;
}

const attemptQuestionSchema =
  new Schema<IAttemptQuestion>(
    {
      questionId: {
        type: String,
        required: true,
      },

      question: {
        type: String,
        required: true,
      },

      options: {
        type: [String],
        required: true,
      },

      questionType: {
        type: String,
        enum: [
          "SINGLE",
          "MULTI",
        ],
        required: true,
      },

      selectedAnswers: {
        type: [String],
        default: [],
      },

      correctAnswers: {
        type: [String],
        required: true,
        default: [],
      },

      isCorrect: {
        type: Boolean,
        required: true,
        default: false,
      },

      marksAwarded: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    {
      _id: false,
    }
  );

export interface IAttempt
  extends Document {
  studentId: Types.ObjectId;

  studentEmail: string;

  studentDepartment: string;

  examId: Types.ObjectId;

  examName: string;

  questionSetId: string;

  examDepartment: string;

  instructorId: string;

  mode: AttemptMode;

  attemptNo: number;

  startTime: Date;

  submittedAt?: Date | null;

  status: AttemptStatus;

  questions: IAttemptQuestion[];

  score: number;

  totalMarks: number;

  correctAnswers: number;

  wrongAnswers: number;

  unanswered: number;

  timeTakenSeconds: number;
}

const attemptSchema =
  new Schema<IAttempt>(
    {
      studentId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },

      studentEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      studentDepartment: {
        type: String,
        required: true,
      },

      examId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Exam",
      },

      examName: {
        type: String,
        required: true,
      },

      questionSetId: {
        type: String,
        required: true,
      },

      examDepartment: {
        type: String,
        required: true,
      },

      instructorId: {
        type: String,
        required: true,
      },

      mode: {
        type: String,
        enum: [
          "COMMON",
          "SPECIAL",
        ],
        required: true,
        default: "COMMON",
      },

      attemptNo: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },

      startTime: {
        type: Date,
        required: true,
      },

      submittedAt: {
        type: Date,
        default: null,
      },

      status: {
        type: String,
        enum: [
          "IN_PROGRESS",
          "SUBMITTED",
          "AUTO_SUBMITTED",
        ],
        required: true,
        default: "IN_PROGRESS",
      },

      questions: {
        type: [attemptQuestionSchema],
        required: true,
        default: [],
      },

      score: {
        type: Number,
        required: true,
        default: 0,
      },

      totalMarks: {
        type: Number,
        required: true,
        default: 0,
      },

      correctAnswers: {
        type: Number,
        required: true,
        default: 0,
      },

      wrongAnswers: {
        type: Number,
        required: true,
        default: 0,
      },

      unanswered: {
        type: Number,
        required: true,
        default: 0,
      },

      timeTakenSeconds: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    {
      collection: "attempts",
      timestamps: false,
      versionKey: false,
    }
  );

const Attempt: Model<IAttempt> =
  mongoose.models.Attempt ||
  mongoose.model<IAttempt>(
    "Attempt",
    attemptSchema,
    "attempts"
  );

export default Attempt;