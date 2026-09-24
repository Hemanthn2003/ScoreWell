import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export interface ISpecialExamStudent
  extends Document {
  examId: Types.ObjectId;
  studentId: Types.ObjectId;
  studentEmail: string;
  studentName: string;
  department: string;
  assignedBy: string;
}

const specialExamStudentSchema =
  new Schema<ISpecialExamStudent>(
    {
      examId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Exam",
      },

      studentId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },

      studentEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      studentName: {
        type: String,
        required: true,
        trim: true,
      },

      department: {
        type: String,
        required: true,
        trim: true,
      },

      assignedBy: {
        type: String,
        required: true,
      },
    },
    {
      collection: "specialExamStudents",
      timestamps: false,
      versionKey: false,
    }
  );

specialExamStudentSchema.index(
  {
    examId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

const SpecialExamStudent: Model<ISpecialExamStudent> =
  mongoose.models.SpecialExamStudent ||
  mongoose.model<ISpecialExamStudent>(
    "SpecialExamStudent",
    specialExamStudentSchema,
    "specialExamStudents"
  );

export default SpecialExamStudent;