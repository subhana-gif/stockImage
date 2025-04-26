import { useState, useEffect } from 'react';
import axios from 'axios';
import { ImageCard } from '../components/ImageCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 3;
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
      const response = await axios.get(`https://stockimage.duckdns.org/api/images/${userId}`);
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

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    navigate('/');
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
      const response = await axios.post(`https://stockimage.duckdns.org/api/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
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
      await axios.delete(`https://stockimage.duckdns.org/api/images/${id}`);
      setImages((prevImages) => prevImages.filter((image) => image._id !== id));
      toast.success('Image deleted successfully');
    } catch (error) {
      toast.error('Error deleting image');
    }
  };

  const handleEdit = async (id: string, updatedTitle: string) => {
    try {
      const response = await axios.put(`https://stockimage.duckdns.org/api/images/edit/${id}`, {
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
      const response = await axios.put(`https://stockimage.duckdns.org/api/images/replace/${id}`, formData, {
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

  // Updated drag and drop implementation to work across pages
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, image: ImageItem, index: number) => {
    // Calculate the actual index in the full array
    const actualIndex = (currentPage - 1) * imagesPerPage + index;
    e.dataTransfer.setData('imageId', image._id);
    e.dataTransfer.setData('sourceIndex', actualIndex.toString());
    
    setDraggedItem(image);
    setDraggedIndex(actualIndex);
    
    if (e.currentTarget) {
      e.currentTarget.classList.add('opacity-50', 'border-purple-500');
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget) {
      e.currentTarget.classList.add('bg-purple-50');
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget) {
      e.currentTarget.classList.remove('bg-purple-50');
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (e.currentTarget) {
      e.currentTarget.classList.remove('bg-purple-50');
    }
    
    const imageId = e.dataTransfer.getData('imageId');
    const sourceIndexStr = e.dataTransfer.getData('sourceIndex');
    const sourceIndex = parseInt(sourceIndexStr);
    
    // Calculate the actual drop index in the full array
    const actualDropIndex = (currentPage - 1) * imagesPerPage + dropIndex;
    
    // Don't do anything if dropping onto the same item
    if (sourceIndex === actualDropIndex) return;
    
    // Create new array and move element
    const newImages = [...images];
    // Find the image by ID to ensure we're moving the correct one
    const draggedImage = newImages.find(img => img._id === imageId);
    
    if (draggedImage) {
      // Remove from old position and insert at new position
      newImages.splice(sourceIndex, 1);
      
      // If dropping at a lower index than the dragged item's original position,
      // we need to insert at the desired index. If dropping at a higher index,
      // we need to adjust for the removed item.
      const adjustedDropIndex = sourceIndex < actualDropIndex ? actualDropIndex - 1 : actualDropIndex;
      newImages.splice(adjustedDropIndex, 0, draggedImage);
      
      // Update state
      setImages(newImages);
    }
    
    setDraggedItem(null);
    setDraggedIndex(null);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Remove styling from all items
    const items = document.querySelectorAll('.image-card');
    items.forEach(item => {
      item.classList.remove('opacity-50', 'border-purple-500', 'bg-purple-50');
    });
    
    setDraggedItem(null);
    setDraggedIndex(null);
  };

  // Added page drop handling for cross-page movement
  const handlePageDrop = (e: React.DragEvent<HTMLDivElement>, targetPage: number) => {
    e.preventDefault();
    
    const imageId = e.dataTransfer.getData('imageId');
    const sourceIndexStr = e.dataTransfer.getData('sourceIndex');
    const sourceIndex = parseInt(sourceIndexStr);
    
    if (imageId && !isNaN(sourceIndex)) {
      // Create new array
      const newImages = [...images];
      // Find the image by ID
      const draggedImage = newImages.find(img => img._id === imageId);
      
      if (draggedImage) {
        // Remove from old position
        newImages.splice(sourceIndex, 1);
        
        // Calculate target position (at the beginning of the target page)
        const targetPosition = (targetPage - 1) * imagesPerPage;
        
        // Insert at new position
        newImages.splice(targetPosition, 0, draggedImage);
        
        // Update state
        setImages(newImages);
        // Navigate to the target page
        setCurrentPage(targetPage);
      }
    }
    
    setDraggedItem(null);
    setDraggedIndex(null);
  };

  const saveNewOrder = async () => {
    try {
      setIsOrdering(true);
      const updatedOrders = images.map((image, index) => ({
        id: image._id,
        order: index
      }));
      
      await axios.put('https://stockimage.duckdns.org/api/images/rearrange', {
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

  // Pagination
  const totalPages = Math.ceil(images.length / imagesPerPage);
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <header className="bg-purple-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Image Gallery</h1>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-700 hover:bg-purple-900 rounded-lg transition-colors shadow"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto p-4">
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          toastClassName="bg-purple-50 text-purple-900 shadow-md"
        />
        
        {/* Image Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4">
          <h2 className="text-xl font-semibold text-purple-800 mb-4">Upload New Images</h2>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors ${
              isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
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
              className="inline-flex items-center cursor-pointer text-purple-600 hover:text-purple-800"
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
                  <div key={index} className="border rounded-lg p-3 bg-purple-50 shadow-sm">
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
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                  className={`px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center shadow ${
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
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-3">
                <button
                  onClick={saveNewOrder}
                  disabled={isOrdering}
                  className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center shadow ${
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
            
            <p className="text-purple-600 italic mb-4">Drag and drop images to rearrange their order (within or between pages)</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentImages.map((image, index) => (
                <div 
                  key={image._id}
                  className={`image-card relative rounded-lg overflow-hidden shadow-md transition-all duration-300 cursor-move
                    ${draggedItem && draggedItem._id === image._id ? 'opacity-50 border-2 border-purple-500' : 'border-2 border-transparent hover:shadow-lg'}`}
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
                    theme="purple"
                  />
                </div>
              ))}
            </div>
            
            {/* Pagination Controls with Drag & Drop Support */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-purple-600 hover:bg-purple-50'
                    } text-sm font-medium focus:z-10 focus:outline-none`}
                  >
                    <ChevronLeft size={16} />
                    <span className="sr-only">Previous</span>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <div
                      key={number}
                      onDragOver={draggedItem ? handleDragOver : undefined}
                      onDrop={draggedItem ? (e) => handlePageDrop(e, number) : undefined}
                      className={draggedItem && currentPage !== number ? "relative cursor-copy" : "relative"}
                    >
                      <button
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === number 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-white text-purple-700 hover:bg-purple-50'
                        } text-sm font-medium focus:z-10 focus:outline-none ${
                          draggedItem && currentPage !== number ? 'ring-2 ring-purple-300' : ''
                        }`}
                      >
                        {number}
                      </button>
                      {draggedItem && currentPage !== number && (
                        <div className="absolute inset-0 bg-purple-100 bg-opacity-30 flex items-center justify-center">
                          <span className="sr-only">Drop here to move to page {number}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-purple-600 hover:bg-purple-50'
                    } text-sm font-medium focus:z-10 focus:outline-none`}
                  >
                    <ChevronRight size={16} />
                    <span className="sr-only">Next</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-10 text-center border-l-4 border-purple-500">
            <p className="text-gray-500 text-lg">You haven't uploaded any images yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;