import { z } from "zod";

export const insertUserSchema = z.object({
  firebaseUid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
  createdAt: z.date().optional(),
});

export const insertMarathonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  distance: z.enum(["3k", "10k", "25k", "42k"]),
  regStartDate: z.string(),
  regEndDate: z.string(),
  startDate: z.string(),
  imageURL: z.string().url(),
  createdBy: z.string(),
});

export const marathonSchema = insertMarathonSchema.extend({
  id: z.string(),
  totalRegistration: z.number().default(0),
  createdAt: z.date().optional(),
});

export const insertRegistrationSchema = z.object({
  userId: z.string(),
  marathonId: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email(),
  contact: z.string().min(1, "Contact number is required"),
  additionalInfo: z.string().optional(),
});

export const registrationSchema = insertRegistrationSchema.extend({
  id: z.string(),
  createdAt: z.date().optional(),
});