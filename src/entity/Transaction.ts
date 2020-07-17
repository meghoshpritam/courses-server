import { Schema, model, Document } from 'mongoose';

export interface Transaction extends Document {
  users: string;
}

const transaction = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  orderObj: { type: Object, required: true },
});

const Transactions = model<Transaction>('Transactions', transaction);

export default Transactions;
