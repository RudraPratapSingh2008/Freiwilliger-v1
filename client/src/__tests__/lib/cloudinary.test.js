import { describe, it, expect } from 'vitest';
import { getOptimizedImageUrl } from '../../lib/cloudinary';

describe('getOptimizedImageUrl', () => {
  it('returns null unchanged', () => {
    expect(getOptimizedImageUrl(null)).toBe(null);
  });

  it('returns undefined unchanged', () => {
    expect(getOptimizedImageUrl(undefined)).toBe(undefined);
  });

  it('returns empty string unchanged', () => {
    expect(getOptimizedImageUrl('')).toBe('');
  });

  it('passes non-cloudinary URLs unchanged', () => {
    const url = 'https://example.com/photo.jpg';
    expect(getOptimizedImageUrl(url)).toBe(url);
  });

  it('passes non-string values unchanged', () => {
    expect(getOptimizedImageUrl(123)).toBe(123);
  });

  it('inserts transform for cloudinary URLs', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const result = getOptimizedImageUrl(url, { width: 400 });
    expect(result).toContain('f_auto,q_auto,w_400');
    expect(result).toContain('/upload/f_auto,q_auto,w_400/');
  });

  it('is idempotent', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const once = getOptimizedImageUrl(url, { width: 400 });
    const twice = getOptimizedImageUrl(once, { width: 400 });
    expect(once).toBe(twice);
  });

  it('uses default width 400', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const result = getOptimizedImageUrl(url);
    expect(result).toContain('w_400');
  });

  it('supports custom width', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const result = getOptimizedImageUrl(url, { width: 800 });
    expect(result).toContain('w_800');
  });

  it('preserves the rest of the URL path', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v123/folder/sample.jpg';
    const result = getOptimizedImageUrl(url, { width: 400 });
    expect(result).toContain('v123/folder/sample.jpg');
  });
});
