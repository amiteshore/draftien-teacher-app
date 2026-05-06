export const ROLES = {
  TEACHER: "teacher",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
