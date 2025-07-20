import { Schema, model, Types } from 'mongoose';
import { IRecoveryRequest } from './recoveryRequest.interface';

const recoveryRequestSchema = new Schema<IRecoveryRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    venueId: {
      type: Schema.Types.ObjectId,
      ref: 'Venue',
      required: false, // only required if type === 'venue'
    },
    type: {
      type: String,
      enum: ['account', 'venue'],
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    reasonForRequest: {
      type: String,
      required: true,
    },
    supportingDocuments: {
      type: [String], // Array of URLs or file paths
      default: [],
    },
    additionalDocuments: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const RecoveryRequest = model("RecoveryRequest", recoveryRequestSchema);
export default RecoveryRequest;