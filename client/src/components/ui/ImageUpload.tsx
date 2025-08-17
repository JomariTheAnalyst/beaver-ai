'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  aiAnalysis?: string;
}

interface ImageUploadProps {
  maxImages?: number;
  onImagesChange?: (images: UploadedImage[]) => void;
  onImageAnalysis?: (imageId: string, analysis: string) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  maxImages = 5,
  onImagesChange,
  onImageAnalysis,
  className = ""
}) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [analyzing, setAnalyzing] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages: UploadedImage[] = [];
    
    for (const file of acceptedFiles) {
      if (images.length + newImages.length >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        break;
      }
      
      const imageId = Math.random().toString(36);
      const preview = URL.createObjectURL(file);
      
      newImages.push({
        id: imageId,
        file,
        preview,
      });
    }
    
    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange?.(updatedImages);
      
      // Analyze each new image with AI
      for (const newImage of newImages) {
        analyzeImage(newImage);
      }
    }
  }, [images, maxImages, onImagesChange]);

  const analyzeImage = async (image: UploadedImage) => {
    setAnalyzing(prev => [...prev, image.id]);
    
    try {
      // Convert file to base64
      const base64 = await fileToBase64(image.file);
      
      // Call AI service to analyze image
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          filename: image.file.name,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const analysis = data.analysis;
        
        // Update image with AI analysis
        setImages(prev => 
          prev.map(img => 
            img.id === image.id 
              ? { ...img, aiAnalysis: analysis }
              : img
          )
        );
        
        onImageAnalysis?.(image.id, analysis);
        toast.success('Image analyzed successfully');
      } else {
        toast.error('Failed to analyze image');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Error analyzing image');
    } finally {
      setAnalyzing(prev => prev.filter(id => id !== image.id));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = error => reject(error);
    });
  };

  const removeImage = (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: maxImages,
    disabled: images.length >= maxImages,
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      {images.length < maxImages && (
        <motion.div
          {...getRootProps()}
          className={`image-upload-zone p-6 text-center ${
            isDragActive ? 'border-primary-400 bg-primary-500/10' : ''
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p className="text-secondary-400 font-medium">
                {isDragActive ? 'Drop images here...' : 'Upload images'}
              </p>
              <p className="text-sm text-secondary-500 mt-1">
                Drag & drop or click to select ({images.length}/{maxImages})
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Image Previews */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="image-preview relative group"
              >
                <img
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                
                {/* Remove button */}
                <motion.button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white 
                           rounded-full flex items-center justify-center opacity-0 
                           group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={() => removeImage(image.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-3 h-3" />
                </motion.button>
                
                {/* Analysis indicator */}
                <div className="absolute bottom-2 left-2">
                  {analyzing.includes(image.id) ? (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                    </div>
                  ) : image.aiAnalysis ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-3 h-3 text-white" />
                    </div>
                  ) : null}
                </div>
                
                {/* AI Analysis tooltip */}
                {image.aiAnalysis && (
                  <div className="absolute inset-0 bg-dark-800/90 opacity-0 group-hover:opacity-100 
                                transition-opacity flex items-center justify-center p-2">
                    <div className="text-xs text-secondary-400 text-center line-clamp-3">
                      {image.aiAnalysis}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;