import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

export interface IPasswordReset extends Document {
  userId: Types.ObjectId;
  email: string;
  otpHash: string;
  resetTokenHash: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
}

const passwordResetSchema =
  new Schema<IPasswordReset>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      otpHash: {
        type: String,
        required: true,
      },

      resetTokenHash: {
        type: String,
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      verified: {
        type: Boolean,
        default: false,
      },

      attempts: {
        type: Number,
        default: 0,
      },
    },
    {
      collection: "password_resets",
      timestamps: true,
      versionKey: false,
    }
  );

/*
 * MongoDB automatically removes expired
 * password reset documents.
 */
passwordResetSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const PasswordReset: Model<IPasswordReset> =
  mongoose.models.PasswordReset ||
  mongoose.model<IPasswordReset>(
    "PasswordReset",
    passwordResetSchema,
    "password_resets"
  );

export default PasswordReset;