import React, { useState } from 'react';
import { Trash2, Edit2, RefreshCw, Check, X } from 'lucide-react';

interface ImageCardProps {
  image: {
    _id: string;
    title: string;
    imageUrl: string;
  };
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onReplace?: (id: string, file: File) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onDelete, onEdit, onReplace }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(image.title);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = () => {
    onEdit(image._id, title);
    setIsEditing(false);
  };

  const handleReplaceClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file && onReplace) {
        onReplace(image._id, file);
      }
    });
    
    input.click();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteConfirming(false);
  };

  const handleEscapeKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTitle(image.title);
      setIsEditing(false);
    } else if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div 
      className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image display */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-300 border-t-blue-600 rounded-full"></div>
          </div>
        )}
        <img
          src={`http://localhost:5000${image.imageUrl}`}
          alt={image.title}
          className={`object-cover w-full h-full transition-all duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'} ${isHovered && !isDeleteConfirming ? 'scale-105 brightness-90' : ''}`}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* Quick actions overlay on hover */}
        {isHovered && isImageLoaded && !isDeleteConfirming && !isEditing && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="p-2 w-full flex justify-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-2 bg-white/90 text-gray-800 rounded-full hover:bg-white transition-colors duration-200"
                title="Edit Title"
              >
                <Edit2 size={16} />
              </button>
              
              {onReplace && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReplaceClick();
                  }}
                  className="p-2 bg-white/90 text-gray-800 rounded-full hover:bg-white transition-colors duration-200"
                  title="Replace Image"
                >
                  <RefreshCw size={16} />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteConfirming(true);
                }}
                className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-white transition-colors duration-200"
                title="Delete Image"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Title and actions */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleEscapeKey}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              autoFocus
              placeholder="Enter image title"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setTitle(image.title);
                  setIsEditing(false);
                }}
                className="p-2 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
              <button
                onClick={handleSave}
                className="p-2 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                title="Save"
              >
                <Check size={16} />
              </button>
            </div>
          </div>
        ) : (
          <h3 
            className="font-medium text-gray-800 line-clamp-2 h-12" 
            title={image.title}
            onClick={() => setIsEditing(true)}
          >
            {image.title || "Untitled Image"}
          </h3>
        )}
      </div>
      
      {/* Delete confirmation overlay */}
      {isDeleteConfirming && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 bg-white rounded-lg shadow-lg text-center max-w-xs mx-4">
            <Trash2 className="mx-auto text-red-500 mb-2" size={24} />
            <p className="mb-4 text-gray-700 font-medium">Are you sure you want to delete this image?</p>
            <div className="flex space-x-3">
              <button 
                onClick={handleCancel}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(image._id);
                }}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};