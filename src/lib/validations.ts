import { z } from 'zod';

export const intakeSchema = z.object({
  referrerName: z.string().min(1, 'Please enter your name'),
  referrerEmail: z.string().email('Please enter a valid email address'),
  referrerRelationship: z.string().min(1, 'Please select your relationship'),
  personFirstName: z.string().min(1, "Please enter the person's first name"),
  personEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  personPhone: z.string().optional(),
  conditions: z.string().optional(),
  situation: z.string().min(10, 'Please share a bit more about what they are walking through'),
  prayerRequests: z.string().min(10, 'Please share some specific prayer requests'),
  notesForMinisters: z.string().optional(),
  howHeard: z.string().optional(),
});

export type IntakeFormData = z.infer<typeof intakeSchema>;

export const verifyCodeSchema = z.object({
  code: z.string().min(1, 'Please enter your meeting room code'),
});

export type VerifyCodeData = z.infer<typeof verifyCodeSchema>;

export const studyRoomSchema = z.object({
  title: z.string().min(3, 'Please enter a room title'),
  description: z.string().optional(),
  startsAt: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

export type StudyRoomData = z.infer<typeof studyRoomSchema>;

export const joinStudyRoomSchema = z.object({
  slug: z.string().min(1, 'Missing room link'),
  accessCode: z.string().min(1, 'Please enter the room access code'),
  name: z.string().min(1, 'Please enter your name'),
});

export type JoinStudyRoomData = z.infer<typeof joinStudyRoomSchema>;
