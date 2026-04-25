import { Schema, model, Document, Types } from 'mongoose';

// Mirrors frontend src/types/workflow.ts Workflow interface exactly, plus userId
export interface IWorkflow extends Document {
  userId: Types.ObjectId;
  name: string;
  nodes: unknown[];
  edges: unknown[];
  createdAt: string;
  updatedAt: string;
}

const workflowSchema = new Schema<IWorkflow>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Untitled Workflow',
    },
    // Flexible Mixed arrays — store any node/edge shape from the frontend
    nodes: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    edges: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    // Frontend uses ISO strings for timestamps — store as strings to match exactly
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    // Disable Mongoose auto-timestamps so frontend string timestamps are authoritative
    timestamps: false,
    // id virtual creates `id` string from `_id`; versionKey removes __v
    id: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      // Strip userId and _id from responses — frontend only uses `id`
      transform: (_doc, ret) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const r = ret as any;
        delete r._id;
        delete r.userId;
        return r;
      },
    },
  }
);

export const Workflow = model<IWorkflow>('Workflow', workflowSchema);
