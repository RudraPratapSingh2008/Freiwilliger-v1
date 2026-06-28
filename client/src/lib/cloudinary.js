/**
 * Transform a Cloudinary URL to include optimization parameters.
 * Non-Cloudinary URLs pass through unchanged.
 * Idempotent — applying twice produces the same result as once.
 *
 * @param {string} url - Image URL
 * @param {object} [options] - Options
 * @param {number} [options.width=400] - Target width
 * @returns {string} Optimized URL or original if not Cloudinary
 */
export function getOptimizedImageUrl(url, { width = 400 } = {}) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;

  const transform = `f_auto,q_auto,w_${width}`;

  // Idempotence: if transform already present, return unchanged
  if (url.includes(transform)) return url;

  // Insert transform after /upload/
  return url.replace('/upload/', `/upload/${transform}/`);
}
