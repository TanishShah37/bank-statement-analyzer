/**
 * File content validation for security
 * Validates uploaded files for malicious patterns and proper format
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate CSV content for malicious patterns
 */
export function validateCSVContent(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push("File is empty");
    return { isValid: false, errors, warnings };
  }

  // Check for formula injection patterns (Excel/CSV injection)
  const formulaPatterns = [
    /^[=+\-@]/gm,  // Starts with =, +, -, @
    /\b(cmd|powershell|bash|sh)\s+/gi,  // Command execution
    /\b(eval|exec|system)\s*\(/gi,  // Code execution functions
    /<script[^>]*>.*?<\/script>/gis,  // Script tags
    /javascript:/gi,  // JavaScript protocol
    /vbscript:/gi,  // VBScript protocol
    /data:text\/html/gi,  // Data URL with HTML
  ];

  const lines = content.split('\n');
  let hasFormulas = false;

  for (const pattern of formulaPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      hasFormulas = true;
      warnings.push(`Potential formula injection detected: ${matches.length} occurrences`);
    }
  }

  if (hasFormulas) {
    warnings.push("File contains potential formula injection patterns. Data will be sanitized during export.");
  }

  // Check for excessively long lines (potential DoS)
  const maxLineLength = 10000;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length > maxLineLength) {
      errors.push(`Line ${i + 1} exceeds maximum length (${maxLineLength} characters)`);
    }
  }

  // Check for null bytes (potential binary data mixed with CSV)
  if (content.includes('\0')) {
    errors.push("File contains null bytes (binary data detected)");
  }

  // Check for excessive number of lines (potential DoS)
  const maxLines = 100000;
  if (lines.length > maxLines) {
    errors.push(`File exceeds maximum line count (${maxLines} lines)`);
  }

  // Check for suspicious patterns (ReDoS vectors)
  const suspiciousPatterns = [
    /(.)\1{50,}/g,  // Repeated characters (50+ times)
    /\([^()]*\([^()]*\([^()]*\)/g,  // Deeply nested parentheses
    /\{[^{}]*\{[^{}]*\{[^{}]*\}/g,  // Deeply nested braces
  ];

  for (const pattern of suspiciousPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 10) {
      warnings.push(`File contains suspicious repeating patterns (${matches.length} occurrences)`);
    }
  }

  // Check for control characters (except standard line endings)
  const controlChars = content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g);
  if (controlChars && controlChars.length > 0) {
    warnings.push(`File contains control characters (${controlChars.length} occurrences)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate file extension
 */
export function validateFileExtension(fileName: string, allowedExtensions: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension) {
    errors.push("File has no extension");
    return { isValid: false, errors, warnings };
  }

  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension .${extension} is not allowed. Allowed: ${allowedExtensions.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate file size
 */
export function validateFileSize(fileSize: number, maxSizeMB: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (fileSize > maxSizeBytes) {
    errors.push(`File exceeds ${maxSizeMB} MB limit (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
  }

  if (fileSize === 0) {
    errors.push("File is empty");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Comprehensive file validation
 */
export function validateFile(file: File, content?: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate file size
  const sizeValidation = validateFileSize(file.size, 10);
  errors.push(...sizeValidation.errors);
  warnings.push(...sizeValidation.warnings);

  // Validate extension
  const extValidation = validateFileExtension(file.name, ['csv', 'pdf', 'txt', 'tsv']);
  errors.push(...extValidation.errors);
  warnings.push(...extValidation.warnings);

  // Validate content if provided
  if (content) {
    const contentValidation = validateCSVContent(content);
    errors.push(...contentValidation.errors);
    warnings.push(...contentValidation.warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
