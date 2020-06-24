import { Schema, model, Document } from 'mongoose';

interface Obj {
  id: string;
  rating: number;
  comment?: string;
  date: Date;
}

export interface Rating extends Document {
  user: string;
  goals?: Obj[];
  projects?: Obj[];
  courses?: Obj[];
}

const ratings = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
  goals: [
    {
      id: { type: Schema.Types.ObjectId, required: true, ref: 'Goals' },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: false },
      date: { type: Date, required: false, default: Date.now },
    },
  ],
  projects: [
    {
      id: { type: Schema.Types.ObjectId, required: true, ref: 'Projects' },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: false },
      date: { type: Date, required: false, default: Date.now },
    },
  ],
  courses: [
    {
      id: { type: Schema.Types.ObjectId, required: true, ref: 'Courses' },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: false },
      date: { type: Date, required: false, default: Date.now },
    },
  ],
});

const Ratings = model<Rating>('Ratings', ratings);

export default Ratings;
