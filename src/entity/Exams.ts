import { Schema, model, Document } from 'mongoose';

export interface Exam extends Document {
  name: string;
  description?: string;
  uri: string;
  creator: string;
  updated?: Date;
  time?: number;
  marls?: number;
}

const exams = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  uri: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  updated: { type: Date, required: false, default: Date.now },
  time: { type: Number, required: false },
  marks: { type: Number, required: false },
});

const Exams = model<Exam>('Exams', exams);

export default Exams;
