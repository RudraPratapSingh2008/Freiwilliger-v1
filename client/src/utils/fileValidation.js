const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file) {
  const errors = [];
  if (!file) return { valid: false, errors: ['No file selected'] };

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 5MB limit`);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only JPEG, PNG, and WebP images are allowed');
  }

  return { valid: errors.length === 0, errors };
}

export function validateDocumentFile(file) {
  const errors = [];
  if (!file) return { valid: false, errors: ['No file selected'] };

  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 5MB limit`);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only images and PDF files are allowed');
  }

  return { valid: errors.length === 0, errors };
}
