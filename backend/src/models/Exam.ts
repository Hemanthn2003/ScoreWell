import mongoose, { Document, Model, Schema } from "mongoose";

export type ExamStatus = "UNPUBLISHED" | "PUBLISHED" | "EXPIRED" | "CLOSED";

export type ExamMode = "COMMON" | "SPECIAL";

export interface INegativeMarking {
  enabled: boolean;
  penalty: number;
}

const negativeMarkingSchema = new Schema<INegativeMarking>(
  {
    enabled: {
      type: Boolean,
      required: true,
      default: false,
    },

    penalty: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

export interface IExam extends Document {
  title: string;
  description: string;

  questionSetIds: string[];
  questionIds: string[];

  department: string;
  instructorId: string;

  durationMinutes: number;
  questionCount: number;
  marksPerQuestion: number;

  negativeMarking: INegativeMarking;

  mode: ExamMode;
  maxAttempts: number;

  /** When the exam should become PUBLISHED. */
  startDate?: Date | null;

  /** When the exam should become EXPIRED. */
  deadlineDate?: Date | null;

  status: ExamStatus;
}

const examSchema = new Schema<IExam>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    questionSetIds: {
      type: [String],
      required: true,
      default: [],
    },

    questionIds: {
      type: [String],
      required: true,
      default: [],
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    instructorId: {
      type: String,
      required: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    questionCount: {
      type: Number,
      required: true,
      min: 1,
    },

    marksPerQuestion: {
      type: Number,
      required: true,
      min: 0,
    },

    negativeMarking: {
      type: negativeMarkingSchema,
      required: true,
    },

    mode: {
      type: String,
      enum: ["COMMON", "SPECIAL"],
      required: true,
      default: "COMMON",
    },

    maxAttempts: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    startDate: {
      type: Date,
      default: null,
    },

    deadlineDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["UNPUBLISHED", "PUBLISHED", "EXPIRED", "CLOSED"],
      required: true,
      default: "UNPUBLISHED",
    },
  },
  {
    collection: "exams",
    timestamps: false,
    versionKey: false,
  },
);

examSchema.index({ status: 1, startDate: 1 });
examSchema.index({ status: 1, deadlineDate: 1 });

const Exam: Model<IExam> =
  mongoose.models.Exam || mongoose.model<IExam>("Exam", examSchema, "exams");

export default Exam;
