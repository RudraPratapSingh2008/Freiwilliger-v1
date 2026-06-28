
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Multer memory storage configuration
const storage = multer.memoryStorage();

// File filter for profile photos
const profilePhotoFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'), false);
  }
};

// File filter for ID documents
const idDocumentFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
  }
};

// Multer instances
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Helper to upload buffer to Cloudinary using streams
 */
const uploadFromBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const cld_upload_stream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
};

/**
 * Middleware for profile photo upload
 */
const uploadProfilePhoto = (req, res, next) => {
  const uploadSingle = upload.single('photo');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Validate type manually if needed or rely on filter (already handled in multer instance if configured)
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)) {
        return res.status(400).json({ success: false, message: 'Invalid file type for profile photo.' });
    }

    try {
      const result = await uploadFromBuffer(req.file.buffer, 'freiwilliger/profiles');
      req.fileUrl = result.secure_url;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Cloudinary upload failed: ' + error.message });
    }
  });
};

/**
 * Middleware for ID document upload
 */
const uploadIdDocument = (req, res, next) => {
  const uploadSingle = upload.single('document');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Validate type
    if (!req.file.mimetype.startsWith('image/') && req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ success: false, message: 'Invalid file type for ID document.' });
    }

    try {
      // Note: We don't log the URL as per requirements
      const result = await uploadFromBuffer(req.file.buffer, 'freiwilliger/id-docs');
      req.fileUrl = result.secure_url;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Cloudinary upload failed: ' + error.message });
    }
  });
};

module.exports = {
  upload,
  uploadProfilePhoto,
  uploadIdDocument
};
