import { Schema, model, Document } from 'mongoose';

interface Ratings {
  user: string;
  rating: number;
  comment?: string;
  date: Date;
  updated?: Date;
}

export interface CourseRating extends Document {
  id: string;
  ratings: Ratings[];
}

const courseRatings = new Schema({
  id: { type: Schema.Types.ObjectId, required: true, ref: 'Courses' },
  ratings: [
    {
      user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, required: false },
      date: { type: Date, required: false, default: Date.now },
      updated: { type: Date, required: false },
    },
  ],
});

const CourseRatings = model<CourseRating>('CourseRatings', courseRatings);

export default CourseRatings;
