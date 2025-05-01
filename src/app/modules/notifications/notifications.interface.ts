import { Schema } from "mongoose";


export interface INotification {
    userId: Schema.Types.ObjectId; // Reference to User
    receiverId: Schema.Types.ObjectId; // Reference to User
    title?: string;
    message: string;
    type:  "added" | "request" | 'recoveryUser' | 'recoveryVenue' | 'subscription' | 'info' ; // Type of notification
    isRead: boolean; // Whether the notification is read
    
  }