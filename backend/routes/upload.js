const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { verifyToken, requireAdmin } = require('../middleware/auth');
const Property = require('../models/Property');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload images for property
router.post('/property-images', verifyToken, requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const { propertyId } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'rama-kuti-properties',
            transformation: [
              { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
              { format: 'webp' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                caption: ''
              });
            }
          }
        ).end(file.buffer);
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // Add images to property
    property.images.push(...uploadedImages);
    
    // Set first image as primary if no primary image exists
    if (!property.images.some(img => img.isPrimary) && property.images.length > 0) {
      property.images[0].isPrimary = true;
    }

    await property.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: uploadedImages,
      property
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
});

// Delete property image
router.delete('/property-images/:imageId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const imageIndex = property.images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const image = property.images[imageIndex];

    // Delete from Cloudinary if it has a public ID
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Remove image from property
    property.images.splice(imageIndex, 1);

    // If this was the primary image and there are other images, make the first one primary
    if (image.isPrimary && property.images.length > 0) {
      property.images[0].isPrimary = true;
    }

    await property.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      property
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during image deletion'
    });
  }
});

// Set primary image for property
router.patch('/property-images/:imageId/primary', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { imageId } = req.params;
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    const image = property.images.id(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Remove primary flag from all images
    property.images.forEach(img => {
      img.isPrimary = false;
    });

    // Set this image as primary
    image.isPrimary = true;

    await property.save();

    res.json({
      success: true,
      message: 'Primary image updated successfully',
      property
    });
  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while setting primary image'
    });
  }
});

// Upload user profile image
router.post('/profile-image', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided'
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'rama-kuti-profiles',
          transformation: [
            { width: 400, height: 400, crop: 'fill', quality: 'auto' },
            { format: 'webp' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile image upload'
    });
  }
});

module.exports = router;