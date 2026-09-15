import { Schema, model, Types } from "mongoose";

interface IPayment {
  group: Types.ObjectId;
  from: Types.ObjectId;
  to: Types.ObjectId;
  amountCents: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amountCents: {
      type: Number,
      required: true,
      min: 1,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Payment = model<IPayment>(
  "Payment",
  paymentSchema,
);

export default Payment;