import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false means password is never returned unless explicitly requested
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    // id: true creates a virtual `id` string from `_id`; versionKey removes __v
    id: true,
    versionKey: false,
    toJSON: { virtuals: true },
  }
);

export const User = model<IUser>('User', userSchema);
