import { Schema, model, Document } from 'mongoose';

export interface Project extends Document {
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
  projectFor?: string[];
  resources?: { name: string; uri: string }[];
  price: number;
}

const projects = new Schema({
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
      name: { type: String, required: true },
      uri: { type: String, required: true },
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
  creator: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  weWillCover: [{ type: String, required: false }],
  requirements: [{ type: String, required: false }],
  projectFor: [{ type: String, required: false }],
  resources: [{ name: { type: String, required: false }, uri: { type: String, required: false } }],
  price: { type: Number, required: true },
});

const Projects = model<Project>('Projects', projects);

export default Projects;
