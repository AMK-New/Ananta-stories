import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStories } from '../context/StoryContext';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Loader2 } from 'lucide-react';

const AdminEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addStory, updateStory, getStory, categories } = useStories();
  const [imageType, setImageType] = useState('url'); // 'url' or 'upload'
  const [processing, setProcessing] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: categories.length > 0 ? categories[0] : 'Mystery',
    description: '',
    content: '',
    images: [] // Array of images instead of single image
  });

  useEffect(() => {
    if (id) {
      const story = getStory(id);
      if (story) {
        // Handle backward compatibility: if story has single 'image', convert to array
        const initialImages = story.images 
          ? story.images 
          : story.image 
            ? [story.image] 
            : [];
        setFormData({
          ...story,
          images: initialImages
        });
        // Check if first image is a base64 string
        if (initialImages.length > 0 && initialImages[0].startsWith('data:')) {
          setImageType('upload');
        }
      }
    } else if (categories.length > 0 && formData.category === 'Mystery') {
      // Set default category to first available category when not editing
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [id, getStory, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    let result;
    if (id) {
      result = await updateStory(parseInt(id), formData);
    } else {
      result = await addStory(formData);
    }
    
    setProcessing(false);
    if (result && result.success) {
      navigate('/admin');
    } else {
      alert(`Error: ${result?.error || 'Failed to save story. The images might be too large (limit is 1MB for the whole story document in Firestore).'}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Show processing state
      setProcessing(true);

      // 2. Validate size (Firestore document limit is 1MB, so we aim for < 300KB per image)
      if (file.size > 300 * 1024) {
        alert('Image is too large! Please choose an image smaller than 300KB to ensure it fits in the database.');
        setProcessing(false);
        return;
      }

      // 3. Convert to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
        setProcessing(false);
      };
      reader.onerror = () => {
        alert('Failed to read file.');
        setProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {id ? 'Edit Story' : 'Add New Story'}
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6 border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter story title"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image Method</label>
              <div className="flex p-1 bg-gray-100 rounded-lg mt-1">
                <button
                  type="button"
                  onClick={() => setImageType('url')}
                  className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                    imageType === 'url' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageType('upload')}
                  className={`flex-1 flex items-center justify-center py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                    imageType === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Upload
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Story Images</label>
            
            <div className="space-y-4">
              {/* Add Image Section */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageType('url')}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      imageType === 'url' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Add Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageType('upload')}
                    className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      imageType === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </button>
                </div>
                
                {imageType === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddImageUrl()}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={!newImageUrl.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
                
                {imageType === 'upload' && (
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors bg-gray-50">
                    <div className="space-y-1 text-center">
                      {processing ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                          <p className="mt-2 text-sm text-gray-600">Processing image...</p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-2 py-0.5">
                              <span>Upload a file</span>
                              <input type="file" className="sr-only" accept="image/*" onChange={handleFileUpload} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 300KB per image</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Image Previews */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Short Summary)</label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Give a brief summary of the story..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Content</label>
            <textarea
              name="content"
              required
              rows={10}
              value={formData.content}
              onChange={handleChange}
              placeholder="Write the full story here..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {id ? 'Update Story' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditor;
