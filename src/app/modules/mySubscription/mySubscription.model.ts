import mongoose, { Schema } from "mongoose";
import { IMySubscription } from "./mySubscription.interface";
import { subscriptionType } from "../subscription/subscription.interface";


const mySubscriptionSchema = new Schema<IMySubscription>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiryDate: { type: Date, required: true },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcription",
    required: true,
  },
  type: {
      type: String,
      enum: subscriptionType
        },
  isExpired: {
    type: Boolean,
    default: false
  },
  isNotified: {
    type: Boolean,
    default: false
  },
});


const MySubscription = mongoose.model<IMySubscription>("MySubcription", mySubscriptionSchema);

export default MySubscription;
