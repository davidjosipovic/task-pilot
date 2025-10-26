import mongoose, { Document, Schema, Types } from 'mongoose';
import { TaskPriority } from './Task';

export interface ITaskTemplate extends Document {
  name: string;
  title: string;
  description: string;
  priority: TaskPriority;
  tags: Types.ObjectId[];
  projectId: Types.ObjectId;
  createdBy: Types.ObjectId;
  isPublic: boolean;
}

const TaskTemplateSchema = new Schema<ITaskTemplate>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ITaskTemplate>('TaskTemplate', TaskTemplateSchema);
