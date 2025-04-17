import { z } from 'zod';

const userValidationSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(1, { message: 'Full name is required' })
      .optional(),
    email: z.string().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
    termsAndConditions: z
    .boolean({ message: 'You must agree to the terms and conditions' })
    .refine(val => val === true, { message: 'You must agree to the terms and conditions' }),
    role: z.literal('user', { message: 'Role must be "user"' }),  // Only allows "user"
  }),
});

const completeUserValidationSchema = z.object({
  body: z.object({
    profileImage: z.string().url().optional(),
    fullName: z
      .string()
      .min(1, { message: 'Full name is required' })
      .optional(),
    dateOfBirth: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid date format" })  // Check if it's a valid date or undefined
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),  // Convert string to Date if provided, otherwise leave as undefined
    gender: z.enum(['male', 'female', 'others'], { message: 'Gender must be one of: male, female, or others' }),  // Corrected to z.enum()
    phone: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 digits' })
      .optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    postalAddress: z.string().optional(),
    about: z.string().optional(),
  }),
});

export const userValidation = {
  userValidationSchema,
  completeUserValidationSchema
};
