import { validateContactInput, getUserTypeLabel } from '../helpers/contact-validation';

describe('validateContactInput', () => {
  it('should reject when name is missing', () => {
    const result = validateContactInput({
      email: 'test@example.com',
      subject: 'Test',
      message: 'Hello',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Tous les champs sont requis');
  });

  it('should reject when email is missing', () => {
    const result = validateContactInput({
      name: 'John',
      subject: 'Test',
      message: 'Hello',
    });
    expect(result.valid).toBe(false);
  });

  it('should reject when subject is missing', () => {
    const result = validateContactInput({
      name: 'John',
      email: 'test@example.com',
      message: 'Hello',
    });
    expect(result.valid).toBe(false);
  });

  it('should reject when message is missing', () => {
    const result = validateContactInput({
      name: 'John',
      email: 'test@example.com',
      subject: 'Test',
    });
    expect(result.valid).toBe(false);
  });

  it('should reject invalid email format', () => {
    const result = validateContactInput({
      name: 'John',
      email: 'not-an-email',
      subject: 'Test',
      message: 'Hello',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Email invalide');
  });

  it('should reject email without domain', () => {
    const result = validateContactInput({
      name: 'John',
      email: 'test@',
      subject: 'Test',
      message: 'Hello',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Email invalide');
  });

  it('should reject email without TLD', () => {
    const result = validateContactInput({
      name: 'John',
      email: 'test@example',
      subject: 'Test',
      message: 'Hello',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Email invalide');
  });

  it('should accept valid input', () => {
    const result = validateContactInput({
      name: 'Marie Dupont',
      email: 'marie@example.com',
      subject: 'Question sur NeuroCare',
      message: 'Bonjour, je souhaite en savoir plus.',
    });
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept email with subdomain', () => {
    const result = validateContactInput({
      name: 'Test',
      email: 'user@mail.example.com',
      subject: 'Test',
      message: 'Hello',
    });
    expect(result.valid).toBe(true);
  });

  it('should reject empty strings as missing fields', () => {
    const result = validateContactInput({
      name: '',
      email: 'test@example.com',
      subject: 'Test',
      message: 'Hello',
    });
    expect(result.valid).toBe(false);
  });
});

describe('getUserTypeLabel', () => {
  it('should return "Famille" for family type', () => {
    expect(getUserTypeLabel('family')).toBe('Famille');
  });

  it('should return "Educateur specialise" for educator type', () => {
    expect(getUserTypeLabel('educator')).toBe('Educateur specialise');
  });

  it('should return "Institution" for institution type', () => {
    expect(getUserTypeLabel('institution')).toBe('Institution');
  });

  it('should return "Autre" for other type', () => {
    expect(getUserTypeLabel('other')).toBe('Autre');
  });

  it('should return "Non specifie" for unknown type', () => {
    expect(getUserTypeLabel('unknown')).toBe('Non specifie');
  });

  it('should return "Non specifie" for undefined', () => {
    expect(getUserTypeLabel(undefined)).toBe('Non specifie');
  });
});
