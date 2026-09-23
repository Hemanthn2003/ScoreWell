import mongoose, {
  Model,
  Schema,
} from "mongoose";

export type QuestionType =
  | "SINGLE"
  | "MULTI";

export interface IQuestion {
  _id: string;
  question: string;
  options: string[];
  questionType: QuestionType;
  answer: string[];
}

const questionSchema =
  new Schema<IQuestion>(
    {
      _id: {
        type: String,
        required: true,
      },

      question: {
        type: String,
        required: true,
        trim: true,
      },

      options: {
        type: [String],
        required: true,
        default: [],
      },

      questionType: {
        type: String,
        enum: [
          "SINGLE",
          "MULTI",
        ],
        required: true,
      },

      answer: {
        type: [String],
        required: true,
        default: [],
      },
    },
    {
      _id: false,
    }
  );

export interface IQuestionSet {
  _id: string;
  questionSetName: string;
  department: string;
  questions: IQuestion[];
  createdBy: string;
  isActive: boolean;
}

const questionSetSchema =
  new Schema<IQuestionSet>(
    {
      _id: {
        type: String,
        required: true,
      },

      questionSetName: {
        type: String,
        required: true,
        trim: true,
      },

      department: {
        type: String,
        required: true,
        trim: true,
      },

      questions: {
        type: [questionSchema],
        required: true,
        default: [],
      },

      createdBy: {
        type: String,
        required: true,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      collection: "questions",
      timestamps: false,
      versionKey: false,
    }
  );

const QuestionSet: Model<IQuestionSet> =
  mongoose.models.QuestionSet ||
  mongoose.model<IQuestionSet>(
    "QuestionSet",
    questionSetSchema,
    "questions"
  );

export default QuestionSet;