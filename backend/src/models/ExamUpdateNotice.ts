import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IExamUpdateNotice extends Document {
  studentId: Types.ObjectId;
  examId: Types.ObjectId;
  examName: string;
  changeId: string;
  seen: boolean;
  createdAt: Date;
}

const examUpdateNoticeSchema = new Schema<IExamUpdateNotice>(
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

    examName: {
      type: String,
      required: true,
    },

    changeId: {
      type: String,
      default: "",
    },

    seen: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "exam_update_notices",
    timestamps: false,
    versionKey: false,
  },
);

examUpdateNoticeSchema.index({ studentId: 1, examId: 1 }, { unique: true });

const ExamUpdateNotice: Model<IExamUpdateNotice> =
  mongoose.models.ExamUpdateNotice ||
  mongoose.model<IExamUpdateNotice>(
    "ExamUpdateNotice",
    examUpdateNoticeSchema,
    "exam_update_notices",
  );

export default ExamUpdateNotice;