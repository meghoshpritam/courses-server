import { Schema, model, Document } from 'mongoose';

export interface Node extends Document {
  name: string;
  description: string;
  img?: string;
  video?: string;
  markdown?: string;
  resources?: { name: string; uri: string }[];
  quiz?: string;
  exam?: string;
  updated: Date;
  creator: string;
  assignment?: string;
}

const nodes = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  img: { type: String, required: false },
  video: { type: String, required: false },
  markdown: { type: String, required: false },
  resources: [
    {
      name: { type: String, required: true },
      uri: { type: String, required: true },
    },
  ],
  quiz: { type: String, required: false },
  exam: { type: Schema.Types.ObjectId, required: false, ref: 'Exams' },
  updated: { type: Date, required: false, default: Date.now },
  creator: { type: Schema.Types.ObjectId, required: true },
  assignment: { type: String, required: false },
});

const Nodes = model<Node>('Nodess', nodes);

export default Nodes;
