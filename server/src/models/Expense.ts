import { Schema, model, Types } from "mongoose";

interface IExpenseSplit {
  user: Types.ObjectId;
  amountCents: number;
}

interface IExpense {
  group: Types.ObjectId;
  description: string;
  amountCents: number;
  paidBy: Types.ObjectId;
  splits: IExpenseSplit[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSplitSchema = new Schema<IExpenseSplit>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amountCents: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const expenseSchema = new Schema<IExpense>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    amountCents: {
      type: Number,
      required: true,
      min: 1,
    },

    paidBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    splits: {
      type: [expenseSplitSchema],
      required: true,
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

const Expense = model<IExpense>("Expense", expenseSchema);

export default Expense;