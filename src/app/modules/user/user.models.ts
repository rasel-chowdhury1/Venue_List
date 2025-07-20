import bcrypt from 'bcrypt';
import { Error, model, Schema } from 'mongoose';
import config from '../../config';
import { TUser, UserModel } from './user.interface';
import { subscriptionType } from '../subscription/subscription.interface';

const userSchema = new Schema<TUser>(
  {
    fullName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'user',
    },
    dateOfBirth: {
      type: Date, // Added date of birth
      required: false, // Optional field
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'others'],
    },
    country: {
      type: String,
      required: false,
      default: ""
    },
    address: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: '', // Optional field
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    venueCreated: {
      type: Boolean,
      default: false,
    },
    venueCreatedAdmin: {
      type: Boolean,
      default: false,
    },
    subscriptionHistory: {
      type: [
        {
          type: {
            type: String,
            enum: subscriptionType,
            required: true,
          },
          purchaseDate: {
            type: Date,
            default: Date.now,
          },
          expiryDate: {
            type: Date,
          },
        },
      ],
      default: [],
    },
    isSubcription: {
       type: String,
       enum: ['none', 'active', 'expired'],
       default: 'none'
    },
    lastLoginAt: {
  type: Date,
  default: null,
},
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    termsAndConditions: {
      type: Boolean,
      required: true,
      default: false, // Assume users must agree to the terms by default (can be updated on registration)
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

userSchema.pre('save', async function (next) {
  const user = this;
  // Hash the password before saving
  user.password = await bcrypt.hash(user.password, Number(config.bcrypt_salt_rounds));
  next();
});

// After saving, remove password from the document
userSchema.post(
  'save',
  function (error: Error, doc: any, next: (error?: Error) => void): void {
    doc.password = ''; // Ensure password is not in the returned document
    next();
  }
);

// Customize the toJSON method to exclude the password field
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password; // Remove password field
  return user;
};

// Filter out deleted documents in find queries
userSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

// Check if a user exists by email
userSchema.statics.isUserExist = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};

// Check if the user is active (not blocked, not deleted)
userSchema.statics.isUserActive = async function (email: string) {
  return await User.findOne({
    email,
    isBlocked: false,
    isDeleted: false,
  }).select('+password');
};

// Find user by ID
userSchema.statics.IsUserExistById = async function (id: string) {
  return await User.findById(id).select('+password');
};

// Compare a plain text password with a hashed password
userSchema.statics.isPasswordMatched = async function (plainTextPassword, hashedPassword) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

export const User = model<TUser, UserModel>('User', userSchema);
