/**
 * Extracted commission calculation logic from app/api/appointments/create-with-payment/route.ts
 * Pure functions for testing Stripe payment calculations.
 */

export const COMMISSION_RATE = 0.12; // 12% platform commission

export interface CommissionResult {
  priceInCents: number;
  commissionAmount: number;
  educatorAmount: number;
}

/**
 * Calculate platform commission and educator revenue from a price in euros.
 */
export function calculateCommission(priceInEuros: number): CommissionResult {
  const priceInCents = Math.round(priceInEuros * 100);
  const commissionAmount = Math.round(priceInCents * COMMISSION_RATE);
  const educatorAmount = priceInCents - commissionAmount;

  return { priceInCents, commissionAmount, educatorAmount };
}

/**
 * Validate that the submitted price matches the expected price based on hourly rate and duration.
 */
export function validatePrice(
  submittedPrice: number,
  hourlyRate: number,
  startTime: string,
  endTime: string
): { valid: boolean; expectedPrice?: number } {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
  const expectedPrice = durationHours * hourlyRate;

  if (Math.abs(submittedPrice - expectedPrice) > 0.01) {
    return { valid: false, expectedPrice };
  }

  return { valid: true, expectedPrice };
}

/**
 * Validate required fields for appointment creation.
 */
export function validateAppointmentInput(input: {
  educatorId?: string;
  familyId?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  price?: number;
}): { valid: boolean; error?: string } {
  const { educatorId, familyId, appointmentDate, startTime, endTime, price } = input;

  if (!educatorId || !familyId || !appointmentDate || !startTime || !endTime || !price) {
    return { valid: false, error: 'Donnees manquantes' };
  }

  return { valid: true };
}
