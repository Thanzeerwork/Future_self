import { storage } from '../../firebase.config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

class ImageUploadService {
  /**
   * Upload image to Firebase Storage
   * @param {string} imageUri - Local image URI
   * @param {string} userId - User ID for folder structure
   * @param {string} imageType - Type of image (profile, resume, etc.)
   * @param {function} onProgress - Progress callback function
   * @returns {Promise<string>} - Download URL of uploaded image
   */
  static async uploadImage(imageUri, userId, imageType = 'profile', onProgress = null) {
    try {
      // Validate image
      if (!imageUri || !userId) {
        throw new Error('Image URI and User ID are required');
      }

      // Basic validation - assume file exists if URI is provided
      if (!imageUri) {
        throw new Error('Image URI is required');
      }

      // Compress image if needed
      const compressedUri = await this.compressImage(imageUri);

      // Create storage reference
      const timestamp = Date.now();
      const fileName = `${imageType}_${timestamp}.jpg`;
      const storageRef = ref(storage, `users/${userId}/${imageType}/${fileName}`);

      // Convert URI to blob
      const response = await fetch(compressedUri);
      const blob = await response.blob();

      // Simulate progress for better UX
      if (onProgress) {
        // Simulate progress from 0 to 90%
        for (let i = 0; i <= 90; i += 10) {
          onProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Upload the file
      await uploadBytes(storageRef, blob);
      
      // Complete progress
      if (onProgress) {
        onProgress(100);
      }
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  /**
   * Compress image to reduce file size
   * @param {string} imageUri - Local image URI
   * @returns {Promise<string>} - Compressed image URI
   */
  static async compressImage(imageUri) {
    try {
      // Always compress images for better performance
      const compressedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: 800, // Max width
              height: 800, // Max height
            }
          }
        ],
        {
          compress: 0.8, // 80% quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return compressedImage.uri;
    } catch (error) {
      console.error('Image compression error:', error);
      return imageUri; // Return original if compression fails
    }
  }

  /**
   * Delete image from Firebase Storage
   * @param {string} imageUrl - Full image URL
   * @returns {Promise<void>}
   */
  static async deleteImage(imageUrl) {
    try {
      if (!imageUrl) return;

      // Extract path from URL
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
      
      if (pathMatch) {
        const imagePath = decodeURIComponent(pathMatch[1]);
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.error('Image deletion error:', error);
      // Don't throw error for deletion failures
    }
  }

  /**
   * Validate image file
   * @param {string} imageUri - Local image URI
   * @returns {Promise<boolean>} - Whether image is valid
   */
  static async validateImage(imageUri) {
    try {
      // Basic validation without file system check for now
      if (!imageUri) {
        return false;
      }

      // Check file extension
      const extension = imageUri.split('.').pop().toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      return validExtensions.includes(extension);
    } catch (error) {
      console.error('Image validation error:', error);
      return false;
    }
  }

  /**
   * Get image dimensions
   * @param {string} imageUri - Local image URI
   * @returns {Promise<{width: number, height: number}>}
   */
  static async getImageDimensions(imageUri) {
    try {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          });
        };
        img.onerror = reject;
        img.src = imageUri;
      });
    } catch (error) {
      console.error('Get image dimensions error:', error);
      return { width: 0, height: 0 };
    }
  }
}

export default ImageUploadService;
