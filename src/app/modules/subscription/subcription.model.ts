import mongoose, { Schema } from 'mongoose';
import { durationTypes, ISubscription, subscriptionType } from './subscription.interface';

const subcriptionSchema: Schema = new Schema<ISubscription>(
    {
        created: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        price: {
            type: Number,
            required: true,
        },
        duration: {
            type: Number, // in month
            required: true,
        },
        durationType: {
            type: String, 
            enum: durationTypes,
            required: true,
        },
        type: {
            type: String,
            enum: subscriptionType,
            required: true
        },
        features: {type: [String], default: []},
        restrictionFeatures: {type: [String], default: []},
        lastDescription: {
            type: String,
            required: false,
        },
        isDeleted: {type: Boolean, default:false},
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const Subcription  = mongoose.model<ISubscription>(
    'Subcription',
    subcriptionSchema,
);
export default Subcription;
