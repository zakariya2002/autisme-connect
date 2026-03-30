import {
  calculateCommission,
  validatePrice,
  validateAppointmentInput,
  COMMISSION_RATE,
} from '../helpers/commission';

describe('calculateCommission', () => {
  it('should calculate 12% commission correctly for a 50EUR session', () => {
    const result = calculateCommission(50);
    expect(result.priceInCents).toBe(5000);
    expect(result.commissionAmount).toBe(600); // 12% of 5000
    expect(result.educatorAmount).toBe(4400);  // 88% of 5000
  });

  it('should calculate commission for a 75EUR session', () => {
    const result = calculateCommission(75);
    expect(result.priceInCents).toBe(7500);
    expect(result.commissionAmount).toBe(900);
    expect(result.educatorAmount).toBe(6600);
  });

  it('should handle decimal prices correctly', () => {
    const result = calculateCommission(45.50);
    expect(result.priceInCents).toBe(4550);
    expect(result.commissionAmount).toBe(546);  // Math.round(4550 * 0.12)
    expect(result.educatorAmount).toBe(4004);
  });

  it('should ensure commission + educator = total', () => {
    const prices = [30, 45, 50, 60, 75, 100, 120, 150];
    prices.forEach(price => {
      const result = calculateCommission(price);
      expect(result.commissionAmount + result.educatorAmount).toBe(result.priceInCents);
    });
  });

  it('should handle very small prices', () => {
    const result = calculateCommission(1);
    expect(result.priceInCents).toBe(100);
    expect(result.commissionAmount).toBe(12);
    expect(result.educatorAmount).toBe(88);
  });

  it('should have COMMISSION_RATE at 12%', () => {
    expect(COMMISSION_RATE).toBe(0.12);
  });
});

describe('validatePrice', () => {
  it('should accept correct price for 1-hour session at 50EUR/h', () => {
    const result = validatePrice(50, 50, '10:00', '11:00');
    expect(result.valid).toBe(true);
    expect(result.expectedPrice).toBe(50);
  });

  it('should accept correct price for 1.5-hour session at 60EUR/h', () => {
    const result = validatePrice(90, 60, '14:00', '15:30');
    expect(result.valid).toBe(true);
    expect(result.expectedPrice).toBe(90);
  });

  it('should accept correct price for 45-minute session', () => {
    const result = validatePrice(37.50, 50, '09:00', '09:45');
    expect(result.valid).toBe(true);
    expect(result.expectedPrice).toBe(37.50);
  });

  it('should reject tampered price (higher than expected)', () => {
    const result = validatePrice(100, 50, '10:00', '11:00');
    expect(result.valid).toBe(false);
    expect(result.expectedPrice).toBe(50);
  });

  it('should reject tampered price (lower than expected)', () => {
    const result = validatePrice(25, 50, '10:00', '11:00');
    expect(result.valid).toBe(false);
  });

  it('should accept price within 0.01 tolerance', () => {
    // 50/3 = 16.666... per 20min, floating point might cause tiny differences
    const result = validatePrice(50.005, 50, '10:00', '11:00');
    expect(result.valid).toBe(true);
  });

  it('should handle 2-hour session correctly', () => {
    const result = validatePrice(100, 50, '08:00', '10:00');
    expect(result.valid).toBe(true);
  });

  it('should handle 30-minute session correctly', () => {
    const result = validatePrice(25, 50, '14:00', '14:30');
    expect(result.valid).toBe(true);
  });
});

describe('validateAppointmentInput', () => {
  const validInput = {
    educatorId: 'edu-1',
    familyId: 'fam-1',
    appointmentDate: '2026-04-15',
    startTime: '10:00',
    endTime: '11:00',
    price: 50,
  };

  it('should accept valid input', () => {
    expect(validateAppointmentInput(validInput).valid).toBe(true);
  });

  it('should reject missing educatorId', () => {
    const result = validateAppointmentInput({ ...validInput, educatorId: undefined });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Donnees manquantes');
  });

  it('should reject missing familyId', () => {
    const result = validateAppointmentInput({ ...validInput, familyId: undefined });
    expect(result.valid).toBe(false);
  });

  it('should reject missing appointmentDate', () => {
    const result = validateAppointmentInput({ ...validInput, appointmentDate: undefined });
    expect(result.valid).toBe(false);
  });

  it('should reject missing startTime', () => {
    const result = validateAppointmentInput({ ...validInput, startTime: undefined });
    expect(result.valid).toBe(false);
  });

  it('should reject missing endTime', () => {
    const result = validateAppointmentInput({ ...validInput, endTime: undefined });
    expect(result.valid).toBe(false);
  });

  it('should reject missing price', () => {
    const result = validateAppointmentInput({ ...validInput, price: undefined });
    expect(result.valid).toBe(false);
  });

  it('should reject completely empty input', () => {
    const result = validateAppointmentInput({});
    expect(result.valid).toBe(false);
  });
});
