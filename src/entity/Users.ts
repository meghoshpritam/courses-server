import { Schema, model, Document } from 'mongoose';

export interface User extends Document {
  name: string;
  email: string;
  active: boolean;
  inactiveMsg?: string;
  role?: string;
  refreshToken?: string[];
  join: Date;
  about?: string;
  avatar?: string;
}

const users = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, indexes: true },
  active: { type: Boolean, required: false, default: true },
  inactiveMsg: { type: String, required: false },
  role: { type: String, required: false, default: 'student' },
  refreshToken: [{ type: String, required: false }],
  join: { type: Date, required: false, default: Date.now },
  about: { type: String, required: false },
  avatar: { type: String, required: false },
});

const Users = model<User>('Users', users);

export default Users;
