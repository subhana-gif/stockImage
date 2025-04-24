import { useState, useEffect } from 'react';
import axios from 'axios';
import { ImageCard } from '../components/ImageCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

// Type definitions
interface ImageItem {
  _id: string;
  title: string;
  imageUrl: string;
  userId: string;
  order: number;
}

const Dashboard = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imageTitles, setImageTitles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ImageItem | null>(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchImages();
  }, [userId, navigate]);

  const fetchImages = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/api/images/${userId}`);
      // Sort images by order if available
      const sortedImages = response.data.sort((a: ImageItem, b: ImageItem) => 
        (a.order !== undefined && b.order !== undefined) ? a.order - b.order : 0
      );
      setImages(sortedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to fetch images');
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newImages.length || imageTitles.filter(title => title.trim()).length !== newImages.length) {
      toast.error('Please select images and enter a title for each one');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    
    newImages.forEach((image, index) => {
      formData.append('images', image);
      formData.append('title', imageTitles[index]);
    });
    
    formData.append('userId', userId || '');
    // Set initial order to be the last in the current sequence
    formData.append('startOrder', images.length.toString());

    try {
      const response = await axios.post(`http://localhost:5000/api/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Fetched response:", response.data);
      
      setImages((prevImages) => [...prevImages, ...response.data]);
      toast.success('Images uploaded successfully');
      
      // Reset form
      setNewImages([]);
      setImageTitles([]);
      if (document.getElementById('fileInput') instanceof HTMLInputElement) {
        (document.getElementById('fileInput') as HTMLInputElement).value = '';
      }
    } catch (error) {
      toast.error('Error uploading images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/images/${id}`);
      setImages((prevImages) => prevImages.filter((image) => image._id !== id));
      toast.success('Image deleted successfully');
    } catch (error) {
      toast.error('Error deleting image');
    }
  };

  const handleEdit = async (id: string, updatedTitle: string) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/images/edit/${id}`, {
        title: updatedTitle,
      });

      setImages((prevImages) =>
        prevImages.map((image) =>
          image._id === id ? { ...image, title: response.data.title } : image
        )
      );

      toast.success('Image title updated successfully');
    } catch (error) {
      toast.error('Error updating image title');
    }
  };

  const handleReplaceImage = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await axios.put(`http://localhost:5000/api/images/replace/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setImages((prevImages) =>
        prevImages.map((image) =>
          image._id === id ? { ...image, imageUrl: response.data.imageUrl } : image
        )
      );
      
      toast.success('Image replaced successfully');
    } catch (error) {
      toast.error('Error replacing image');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedTitles = [...imageTitles];
    updatedTitles[index] = e.target.value;
    setImageTitles(updatedTitles);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length) {
      setNewImages(files);
      // Initialize titles array with empty strings
      setImageTitles(Array(files.length).fill(''));
    }
  };

  // Custom drag and drop implementation without React DnD
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, image: ImageItem, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedItem(image);
    
    // Add styling to dragged element
    if (e.currentTarget) {
      e.currentTarget.classList.add('opacity-50', 'border-blue-500');
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget) {
      e.currentTarget.classList.add('bg-blue-50');
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget) {
      e.currentTarget.classList.remove('bg-blue-50');
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    // Remove styling
    if (e.currentTarget) {
      e.currentTarget.classList.remove('bg-blue-50');
    }
    
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    // Don't do anything if dropping onto the same item
    if (dragIndex === dropIndex) return;
    
    // Create new array and move element
    const newImages = [...images];
    const draggedImage = newImages[dragIndex];
    
    // Remove from old position and insert at new position
    newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    // Update state
    setImages(newImages);
    setDraggedItem(null);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Remove styling from all items
    const items = document.querySelectorAll('.image-card');
    items.forEach(item => {
      item.classList.remove('opacity-50', 'border-blue-500', 'bg-blue-50');
    });
    
    setDraggedItem(null);
  };

  const saveNewOrder = async () => {
    try {
      setIsOrdering(true);
      const updatedOrders = images.map((image, index) => ({
        id: image._id,
        order: index
      }));
      
      await axios.put('http://localhost:5000/api/images/rearrange', {
        images: updatedOrders
      });
      
      toast.success('Image order saved successfully');
    } catch (error) {
      toast.error('Failed to save image order');
      console.error('Error saving image order:', error);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Images</h1>
      
      {/* Image Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Upload New Images</h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
        >
          <input
            id="fileInput"
            type="file"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setNewImages(files);
              setImageTitles(Array(files.length).fill(''));
            }}
            className="hidden"
          />
          <label 
            htmlFor="fileInput" 
            className="inline-flex items-center cursor-pointer text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-lg">Select images or drag and drop here</span>
          </label>
          {newImages.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">{newImages.length} file(s) selected</p>
          )}
        </div>
        
        {newImages.length > 0 && (
          <form onSubmit={handleImageUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newImages.map((file, index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <div className="mb-2 h-40 overflow-hidden rounded">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <input
                    type="text"
                    value={imageTitles[index] || ''}
                    onChange={(e) => handleTitleChange(e, index)}
                    placeholder={`Title for image ${index + 1}`}
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setNewImages([]);
                  setImageTitles([]);
                  if (document.getElementById('fileInput') instanceof HTMLInputElement) {
                    (document.getElementById('fileInput') as HTMLInputElement).value = '';
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
                  isUploading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Upload Images'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Image Gallery Section */}
      {images.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">My Gallery</h2>
            <div className="flex space-x-3">
              <button
                onClick={saveNewOrder}
                disabled={isOrdering}
                className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center ${
                  isOrdering ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isOrdering ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Order
                  </>
                )}
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 italic mb-4">Drag and drop images to rearrange their order</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div 
                key={image._id}
                className={`image-card relative rounded-lg overflow-hidden shadow-md transition-all duration-300 cursor-move
                  ${draggedItem && draggedItem._id === image._id ? 'opacity-50 border-2 border-blue-500' : 'border-2 border-transparent hover:shadow-lg'}`}
                draggable
                onDragStart={(e) => handleDragStart(e, image, index)}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <ImageCard
                  image={image}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onReplace={handleReplaceImage}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-10 text-center">
          <p className="text-gray-500 text-lg">You haven't uploaded any images yet.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;