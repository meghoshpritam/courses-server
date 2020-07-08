import { Schema, model, Document } from 'mongoose';

interface Ratings {
  user: string;
  rating: number;
  comment?: string;
  date: Date;
  updated?: Date;
}

export interface GoalRating extends Document {
  id: string;
  ratings: Ratings[];
}

const goalRatings = new Schema({
  id: { type: Schema.Types.ObjectId, required: true, ref: 'Goals' },
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

const GoalRatings = model<GoalRating>('GoalRatings', goalRatings);

export default GoalRatings;
