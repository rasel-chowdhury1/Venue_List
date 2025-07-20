import { Document, Schema} from 'mongoose';

export interface IRecoveryRequest extends Document {
  userId: Schema.Types.ObjectId;
  venueId?: Schema.Types.ObjectId;
  type: 'account' | 'venue';
  email: string;
  reasonForRequest: string;
  supportingDocuments: string[];
  additionalDocuments?: string;
  status: 'pending' | 'approved' | 'rejected';
}