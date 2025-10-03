import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { motion } from 'framer-motion';
import { Upload, X, Image, FileText, CheckCircle } from 'lucide-react';
import { receiptAPI } from '../../api/receipts';
import Toast from 'react-hot-toast';

const ReceiptUpload = ({ transactionId, onSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation(receiptAPI.uploadReceipt, {
    onSuccess: (data) => {
      Toast.success('Receipt uploaded successfully');
      if (onSuccess) {
        onSuccess(data.data.receipt);
      }
    },
    onError: (error) => {
      Toast.error('Failed to upload receipt');
    }
  });

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        Toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        Toast.error('File size must be less than 5MB');
        return;
      }

      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('receipt', file);
    if (transactionId) {
      formData.append('transactionId', transactionId);
    }

    uploadMutation.mutate(formData);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-primary-medium rounded-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">Upload Receipt</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-color hover:border-accent-primary/50'
              }`}
              onClick={() => document.getElementById('receipt-file').click()}
            >
              <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Upload Receipt
              </h3>
              <p className="text-text-muted mb-4">
                Drag and drop an image file, or click to browse
              </p>
              <p className="text-sm text-text-muted">
                Supported formats: JPG, PNG, GIF • Max size: 5MB
              </p>
              <input
                id="receipt-file"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative">
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="w-full h-64 object-contain rounded-lg border border-border-color"
                />
                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1 bg-accent-error text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* File Info */}
              <div className="flex items-center space-x-3 p-3 bg-primary-light rounded-lg">
                <FileText className="w-8 h-8 text-accent-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-medium truncate">
                    {file.name}
                  </p>
                  <p className="text-text-muted text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadMutation.isLoading && (
                <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner"></div>
                    <span className="text-text-primary text-sm">Uploading receipt...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={uploadMutation.isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploadMutation.isLoading}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              {uploadMutation.isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Upload Receipt</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ReceiptUpload;