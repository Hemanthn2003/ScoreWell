import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export type UserRole =
  | "STUDENT"
  | "INSTRUCTOR"
  | "PRINCIPAL";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string | null;
  isActive: boolean;
  isPermitted: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "STUDENT",
        "INSTRUCTOR",
        "PRINCIPAL",
      ],
      required: true,
    },

    department: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isPermitted: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "user",
    timestamps: false,
    versionKey: false,
  }
);

const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>(
    "User",
    userSchema,
    "user"
  );

export default User;