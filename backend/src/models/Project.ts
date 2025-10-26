import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  owner: Types.ObjectId;
  archived: boolean;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  archived: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IProject>('Project', ProjectSchema);
