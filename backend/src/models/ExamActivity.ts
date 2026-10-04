import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IExamActivity extends Document {
  studentId: Types.ObjectId;
  examId: Types.ObjectId;
  attemptId: Types.ObjectId;
  attemptNo: number;
  count: number;
  pausedAt?: Date | null;
}

const examActivitySchema = new Schema<IExamActivity>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    examId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Exam",
    },

    attemptId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Attempt",
      unique: true,
    },

    attemptNo: {
      type: Number,
      required: true,
      min: 1,
    },

    count: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    pausedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "examActivities",
    timestamps: false,
    versionKey: false,
  },
);

const ExamActivity: Model<IExamActivity> =
  mongoose.models.ExamActivity ||
  mongoose.model<IExamActivity>(
    "ExamActivity",
    examActivitySchema,
    "examActivities",
  );

export default ExamActivity;
