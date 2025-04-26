import React, { useState } from 'react';
import { Trash2, Edit2, RefreshCw, Check, X, Eye } from 'lucide-react';

interface ImageCardProps {
  image: {
    _id: string;
    title: string;
    imageUrl: string;
  };
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onReplace?: (id: string, file: File) => void;
  theme?: 'purple' | 'default';
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onDelete, onEdit, onReplace, theme = 'default' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(image.title);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Theme color variables
  const themeColors = {
    primary: theme === 'purple' ? 'purple' : 'blue',
    hover: theme === 'purple' ? 'bg-purple-50' : 'bg-blue-50',
    button: theme === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700',
    text: theme === 'purple' ? 'text-purple-800' : 'text-gray-800',
    accent: theme === 'purple' ? 'text-purple-600' : 'text-blue-600',
    border: theme === 'purple' ? 'border-purple-300' : 'border-gray-300',
    ring: theme === 'purple' ? 'ring-purple-500' : 'ring-blue-500',
    spinner: theme === 'purple' ? 'border-purple-300 border-t-purple-600' : 'border-blue-300 border-t-blue-600',
  };

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
      className={`group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white ${theme === 'purple' ? 'border-purple-100' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image display */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`animate-spin w-8 h-8 border-4 ${themeColors.spinner} rounded-full`}></div>
          </div>
        )}
        <img
          src={`https://stockimage.duckdns.org${image.imageUrl}`}
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
                  setIsPreviewOpen(true);
                }}
                className="p-2 bg-white/90 text-gray-800 rounded-full hover:bg-white transition-colors duration-200"
                title="Preview Image"
              >
                <Eye size={16} />
              </button>
              
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
              className={`w-full p-2 border ${themeColors.border} rounded-md focus:ring-2 focus:${themeColors.ring} focus:border-${themeColors.primary}-500 outline-none`}
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
                className={`p-2 ${themeColors.accent} rounded-md hover:${themeColors.hover} transition-colors`}
                title="Save"
              >
                <Check size={16} />
              </button>
            </div>
          </div>
        ) : (
          <h3 
            className={`font-medium ${themeColors.text} line-clamp-2 h-12 cursor-pointer hover:${themeColors.accent}`} 
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
      
      {/* Image Preview Modal */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4" 
          onClick={() => setIsPreviewOpen(false)}
        >
          <div 
            className="max-w-4xl max-h-full bg-white rounded-lg shadow-2xl overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={`https://stockimage.duckdns.org${image.imageUrl}`}
                alt={image.title}
                className="max-h-[80vh] w-auto mx-auto"
              />
              <button 
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                onClick={() => setIsPreviewOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 bg-white">
              <h3 className={`text-xl font-medium ${themeColors.text}`}>{image.title || "Untitled Image"}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};