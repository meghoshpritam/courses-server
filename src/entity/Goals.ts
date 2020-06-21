import { Schema, model, Document } from 'mongoose';

export interface Goal extends Document {
  name: string;
  description: string;
  img?: string;
  video?: string;
  nodes?: string[];
  exams?: string[];
  projects?: string[];
  assignments?: string[];
  updated: Date;
  creator: string;
  weWillCover: string[];
  requirements?: string[];
  courseFor?: string[];
  resources?: { name: string; uri: string }[];
  price: number;
}

const goals = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  img: { type: String, required: false },
  video: { type: String, required: false },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Courses', required: false }],
  exams: [{ type: Schema.Types.ObjectId, ref: 'Exams', required: false }],
  projects: [{ type: Schema.Types.ObjectId, ref: 'Projects', required: false }],
  assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignments', required: false }],
  updated: { type: Date, required: false, default: Date.now },
  creator: { type: Schema.Types.ObjectId, required: true },
  weWillCover: [{ type: String, required: false }],
  requirements: [{ type: String, required: false }],
  courseFor: [{ type: String, required: false }],
  resources: [{ name: { type: String, required: false }, uri: { type: String, required: false } }],
  price: { type: Number, required: true },
});

const Goals = model<Goal>('Goals', goals);

export default Goals;
