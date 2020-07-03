import { Schema, model, Document } from 'mongoose';

export interface CourseRating extends Document {
  user: string;
  id: string;
  rating: number;
  comment: string;
  date: Date;
}

const courseRatings = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
  id: { type: Schema.Types.ObjectId, required: true, ref: 'Courses' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: false },
  date: { type: Date, required: false, default: Date.now },
});

const CourseRatings = model<CourseRating>('Ratings', courseRatings);

export default CourseRatings;
