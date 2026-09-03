export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return '';
}

export function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return '';
}

export function validateRequired(value, fieldName = 'This field') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return '';
}

export function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
}

export function validatePhone(phone) {
  if (!phone) return ''; // Phone is optional
  const phoneRegex = /^[+]?[\d\s()-]{7,20}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return '';
}
