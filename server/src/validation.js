const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{10}$/;

function normalizePhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0090') && digits.length === 14) digits = digits.slice(4);
  else if (digits.startsWith('90') && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  return digits;
}

export function normalizeParticipant(input = {}) {
  return {
    firstName: typeof input.firstName === 'string' ? input.firstName.trim() : '',
    lastName: typeof input.lastName === 'string' ? input.lastName.trim() : '',
    phone: typeof input.phone === 'string' ? normalizePhone(input.phone) : '',
    email: typeof input.email === 'string' ? input.email.trim().toLowerCase() : '',
  };
}

export function validateParticipant(input) {
  const errors = {};
  if (input.firstName.length < 2 || input.firstName.length > 60) errors.firstName = 'Ad 2-60 karakter arasında olmalı.';
  if (input.lastName.length < 2 || input.lastName.length > 60) errors.lastName = 'Soyad 2-60 karakter arasında olmalı.';
  if (!phonePattern.test(input.phone)) errors.phone = 'Geçerli bir telefon numarası girin.';
  if (!emailPattern.test(input.email) || input.email.length > 160) errors.email = 'Geçerli bir e-posta adresi girin.';
  return errors;
}
