import { Model, Schema } from 'mongoose';

export interface TUserCreate {
  fullName?: string;
  email: string;
  password: string;
  profileImage?: string; // Optional profile image URL
  city: string;
  postalAddress?: string;
  about?: string;
  dateOfBirth?: Date;
  isBlocked: boolean;
  isDeleted: boolean;
  role: string;
  phone?: string;
  gender?: 'male' | 'female' | 'others'; // Gender field
  country: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  venueCreated: boolean; // Indicates if the user has created a venue
  isSubcription: 'none' | 'active' | 'expired';
  termsAndConditions: boolean;
  lastLoginAt?: Date;
}

export interface TUser extends TUserCreate {
  _id: string;
}

export interface DeleteAccountPayload {
  password: string;
}

export interface UserModel extends Model<TUser> {
  // Check if user exists by email (including password)
  isUserExist(email: string): Promise<TUser>;

  // Check if a user is active (not blocked, not deleted)
  isUserActive(email: string): Promise<TUser>;

  // Find user by ID
  IsUserExistById(id: string): Promise<TUser>;

  // Compare password (plaintext vs. hashed)
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;

  // Additional functionality: Fetch active users
  getActiveUsers(): Promise<TUser[]>; // Example for future extension
}

export type IPaginationOption = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
