import mongoose, { Document, Schema, Types } from 'mongoose';

export type TaskStatus = 'TODO' | 'DOING' | 'DONE';

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  assignedUser: Types.ObjectId;
  projectId: Types.ObjectId;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['TODO', 'DOING', 'DONE'], default: 'TODO' },
  assignedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true });

export default mongoose.model<ITask>('Task', TaskSchema);
