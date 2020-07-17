import { Schema, model, Document } from 'mongoose';

interface Obj {
  id: string;
  date: Date;
  price: number;
  transactionId: string;
  active?: boolean;
  inactiveMsg?: string;
  reference?: string;
  orderId: string;
}

export interface MyCourse extends Document {
  user: string;
  goals: Obj[];
  courses: Obj[];
  projects: Obj[];
}

const myCourses = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'Users' },
  goals: [
    {
      id: { type: Schema.Types.ObjectId, required: true, ref: 'Goals' },
      date: { type: Date, required: false, default: Date.now },
      price: { type: Number, required: true },
      transactionId: { type: String, required: true },
      active: { type: Boolean, required: false, default: true },
      inactiveMsg: { type: String, required: false },
      reference: { type: String, required: false },
      orderId: { type: String, required: true },
    },
  ],
  courses: [
    {
      id: { type: Schema.Types.ObjectId, required: true, ref: 'Courses' },
      date: { type: Date, required: false, default: Date.now },
      price: { type: Number, required: true },
      transactionId: { type: String, required: true },
      active: { type: Boolean, required: false, default: true },
      inactiveMsg: { type: String, required: false },
      reference: { type: String, required: false },
      orderId: { type: String, required: true },
    },
  ],
  projects: [
    {
      id: { type: Schema.Types.ObjectId, required: true, ref: 'Projects' },
      date: { type: Date, required: false, default: Date.now },
      price: { type: Number, required: true },
      transactionId: { type: String, required: true },
      active: { type: Boolean, required: false, default: true },
      inactiveMsg: { type: String, required: false },
      reference: { type: String, required: false },
      orderId: { type: String, required: true },
    },
  ],
});

const MyCourses = model<MyCourse>('MyCourses', myCourses);

export default MyCourses;
