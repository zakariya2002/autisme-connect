/**
 * Extracted validation logic from app/api/contact/route.ts
 * Pure functions for testing contact form validation.
 */

export interface ContactInput {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  userType?: string;
}

export interface ContactValidationResult {
  valid: boolean;
  error?: string;
}

export function validateContactInput(input: ContactInput): ContactValidationResult {
  const { name, email, subject, message } = input;

  if (!name || !email || !subject || !message) {
    return { valid: false, error: 'Tous les champs sont requis' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Email invalide' };
  }

  return { valid: true };
}

export function getUserTypeLabel(userType: string | undefined): string {
  const userTypeMap: Record<string, string> = {
    family: 'Famille',
    educator: 'Educateur specialise',
    institution: 'Institution',
    other: 'Autre',
  };
  return userTypeMap[userType as string] || 'Non specifie';
}
