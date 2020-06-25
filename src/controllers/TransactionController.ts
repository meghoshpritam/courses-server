import * as Razorpay from 'razorpay';
import { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
config();

class TransactionController {
  public static instance = new Razorpay({
    key_id: process.env.RZP_KEY_ID,
    key_secret: process.env.RZP_KEY_SECRET,
  });

  public static createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const { courseId, projectId, goalId } = req.body;
    console.log(Razorpay);
    try {
      const amount = 20;

      const data = await TransactionController.instance.orders.create({
        amount: 1000, // amount in the smallest currency unit
        currency: 'INR',
        receipt: 'order_rcptid_11',
        payment_capture: 1,
      });

      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  };

  // TODO: verify and store on the db
  // generated_signature = hmac_sha256(razorpay_order_id + "|" + razorpay_payment_id, secret);  if (generated_signature == razorpay_signature) {    payment is successful  }
  /*
  const crypto = require("crypto");
const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);

hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
let generatedSignature = hmac.digest('hex');

let isSignatureValid = generatedSignature == payload.razorpay_signature;
// https://nodejs.org/api/crypto.html#crypto_class_hmac
   */
}

export default TransactionController;
