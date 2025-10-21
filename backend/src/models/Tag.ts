import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITag extends Document {
  name: string;
  color: string;
  projectId: Types.ObjectId;
}

const TagSchema = new Schema<ITag>({
  name: { type: String, required: true },
  color: { type: String, required: true, default: '#3B82F6' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true });

// Create index for efficient queries by project
TagSchema.index({ projectId: 1 });

export default mongoose.model<ITag>('Tag', TagSchema);
