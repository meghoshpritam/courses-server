import { Schema, model, Document } from 'mongoose';

export interface Course extends Document {
  name: string;
  description: string;
  img?: string;
  video?: string;
  nodes?: { id: string; chapter: string }[];
  exams?: { id: string; chapter: string }[];
  projects?: { id: string; chapter: string }[];
  assignments?: { id: string; chapter: string }[];
  updated: Date;
  creator: string;
  weWillCover: string[];
  requirements?: string[];
  courseFor?: string[];
  resources?: { name: string; uri: string }[];
  price: number;
}

const courses = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  img: { type: String, required: false },
  video: { type: String, required: false },
  nodes: [
    {
      id: { type: Schema.Types.ObjectId, ref: 'Nodes', required: true },
      chapter: { type: String, required: true },
    },
  ],
  exams: [
    {
      id: { type: Schema.Types.ObjectId, ref: 'Exams', required: true },
      chapter: { type: String, required: true },
    },
  ],
  projects: [
    {
      id: { type: Schema.Types.ObjectId, ref: 'Projects', required: true },
      chapter: { type: String, required: true },
    },
  ],
  assignments: [
    {
      id: { type: Schema.Types.ObjectId, ref: 'Assignments', required: true },
      chapter: { type: String, required: true },
    },
  ],
  updated: { type: Date, required: false, default: Date.now },
  creator: { type: Schema.Types.ObjectId, required: true },
  weWillCover: [{ type: String, required: false }],
  requirements: [{ type: String, required: false }],
  courseFor: [{ type: String, required: false }],
  resources: [{ name: { type: String, required: false }, uri: { type: String, required: false } }],
  price: { type: Number, required: true },
});

const Courses = model<Course>('Courses', courses);

export default Courses;
