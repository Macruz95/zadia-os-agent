/**
 * Reusable date utilities for the entire application
 * Handles timezone issues and provides safe date operations
 */

/**
 * Safely parse a date string to Date object without timezone issues
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object at local midnight
 */
export const parseDateString = (dateString: string): Date => {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Invalid date string provided');
  }

  // Split the date string and create date at local midnight
  const [year, month, day] = dateString.split('-').map(Number);

  if (!year || !month || !day) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  // Create date at local midnight to avoid timezone conversion issues
  return new Date(year, month - 1, day);
};

/**
 * Safely format a Date object to string without timezone issues
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateToString = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date object provided');
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Check if a value is a valid Date object
 * @param value - Value to check
 * @returns True if value is a valid Date
 */
export const isValidDate = (value: unknown): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

/**
 * Format date for display in Spanish locale
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string => {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to formatDate');
  }

  return new Intl.DateTimeFormat('es-ES', options).format(date);
};

/**
 * Format date and time for display in Spanish locale
 * @param date - Date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date): string => {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to formatDateTime');
  }

  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Calculate age from birth date
 * @param birthDate - Birth date
 * @returns Age in years
 */
export const calculateAge = (birthDate: Date): number => {
  if (!isValidDate(birthDate)) {
    throw new Error('Invalid birth date provided to calculateAge');
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Get date for input field (safe for HTML date inputs)
 * @param date - Date object or date string
 * @returns Date string in YYYY-MM-DD format or empty string
 */
export const getDateForInput = (date: Date | string | undefined | null): string => {
  if (!date) return '';

  if (typeof date === 'string') {
    // If it's already a valid date string, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Try to parse it as a date
    const parsedDate = new Date(date);
    return isValidDate(parsedDate) ? formatDateToString(parsedDate) : '';
  }

  if (isValidDate(date)) {
    return formatDateToString(date);
  }

  return '';
};

/**
 * Convert input value to Date object safely
 * @param inputValue - Value from HTML date input
 * @returns Date object or undefined
 */
export const inputValueToDate = (inputValue: string): Date | undefined => {
  if (!inputValue || typeof inputValue !== 'string') {
    return undefined;
  }

  try {
    return parseDateString(inputValue);
  } catch {
    return undefined;
  }
};

/**
 * Check if two dates are the same day (ignoring time)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  if (!isValidDate(date1) || !isValidDate(date2)) {
    return false;
  }

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get start of day (00:00:00.000)
 * @param date - Date to get start of day for
 * @returns New Date object at start of day
 */
export const startOfDay = (date: Date): Date => {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to startOfDay');
  }

  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get end of day (23:59:59.999)
 * @param date - Date to get end of day for
 * @returns New Date object at end of day
 */
export const endOfDay = (date: Date): Date => {
  if (!isValidDate(date)) {
    throw new Error('Invalid date provided to endOfDay');
  }

  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};