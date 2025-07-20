import { Schema, model } from 'mongoose';
import { INotification } from './notifications.interface';


const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    title: {
      type: String,
      default: ""
    },
    message: {
      type: String,
      required: true, // The message object itself is required
    },
    type: {
      type: String,
      enum: [ "added", "request", 'recoveryUser', 'recoveryVenue', 'subscription', 'info' ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Create and export the Notification model
const Notification = model<INotification>('Notification', NotificationSchema);

export default Notification;