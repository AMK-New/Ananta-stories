import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStories } from '../context/StoryContext';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const AdminEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addStory, updateStory, getStory } = useStories();
  const [imageType, setImageType] = useState('url'); // 'url' or 'upload'
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Mystery',
    description: '',
    content: '',
    image: ''
  });

  useEffect(() => {
    if (id) {
      const story = getStory(id);
      if (story) {
        setFormData(story);
        // If image URL is from Firebase storage or is a base64, consider it an upload
        if (story.image && (story.image.includes('firebasestorage') || story.image.startsWith('data:'))) {
          setImageType('upload');
        }
      }
    }
  }, [id, getStory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await updateStory(parseInt(id), formData);
    } else {
      await addStory(formData);
    }
    navigate('/admin');
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
      // 1. Show uploading state
      setUploading(true);

      // 2. Create a storage reference
      const storageRef = ref(storage, `story-images/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // 3. Monitor upload
      uploadTask.on('state_changed', 
        (snapshot) => {
          // You could track progress here if needed
        }, 
        (error) => {
          console.error("Upload failed:", error);
          setUploading(false);
          alert("Image upload failed. Please try again.");
        }, 
        () => {
          // 4. Handle successful upload
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFormData(prev => ({
              ...prev,
              image: downloadURL
            }));
            setUploading(false);
          });
        }
      );
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const categories = ["Mystery", "Romance", "Thriller", "History"];

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Story Cover Image</label>
            {imageType === 'url' ? (
              <input
                type="url"
                name="image"
                required
                value={formData.image && !formData.image.includes('firebasestorage') ? formData.image : ''}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
              />
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-400 transition-colors bg-gray-50">
                <div className="space-y-1 text-center">
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                      <p className="mt-2 text-sm text-gray-600">Uploading to Firebase...</p>
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
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {formData.image && (
              <div className="mt-4 relative inline-block">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="h-32 w-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
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
