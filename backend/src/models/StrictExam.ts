import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IStrictExam extends Document {
  examId: Types.ObjectId;
  questionSetIds: string[];
  attemptChances: number;
  deadlineDate: Date;
  instructorId: string;
  durationMinutes: number;
}

const strictExamSchema = new Schema<IStrictExam>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "Exam",
    },
    questionSetIds: {
      type: [String],
      required: true,
      default: [],
    },
    attemptChances: {
      type: Number,
      required: true,
      min: 1,
    },
    deadlineDate: {
      type: Date,
      required: true,
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
  },
  {
    collection: "strictExam",
    timestamps: false,
    versionKey: false,
  },
);

const StrictExam: Model<IStrictExam> =
  mongoose.models.StrictExam ||
  mongoose.model<IStrictExam>("StrictExam", strictExamSchema, "strictExam");

export default StrictExam;
