import { model, Schema } from "mongoose";
import { IProfile } from "./profile.interface";

// Define the Profile schema
const ProfileSchema = new Schema<IProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure the profile is linked to a user
      unique: true,  // Ensure the user is unique in this collection
    },
    about: {
      type: String,
      default: '', // Optional field
    },
    
    city: {
      type: String,
      default: '', // Optional field
    },
    postalAddress: {
      type: String,
      default: '', // Optional field
    },
    postalCode: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
  }
);

// Index user field for faster lookups (optional, if frequently queried)
ProfileSchema.index({ user: 1 });

const Profile = model<IProfile>("Profile", ProfileSchema);
export default Profile;
