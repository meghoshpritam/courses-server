import { Schema, model, Document } from 'mongoose';

export interface Assignment extends Document {
  name: string;
  description?: string;
  uri: string;
  creator: string;
  updated?: Date;
  deadline?: number;
  marks?: number;
}

const assignment = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  uri: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  updated: { type: Date, required: false, default: Date.now },
  deadline: { type: Number, required: false },
  marks: { type: Number, required: false },
});

const Assignments = model<Assignment>('Assignments', assignment);

export default Assignments;
