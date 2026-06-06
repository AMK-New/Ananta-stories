import { useState } from 'react';
import { useParams } from 'react-router-dom';
import StoryCard from '../components/StoryCard';
import { useStories } from '../context/StoryContext';
import { useAuth } from '../context/AuthContext';
import { Edit, Save, X } from 'lucide-react';

const Category = () => {
  const { category } = useParams();
  const { stories, categories, updateCategoryMetadata } = useStories();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [tempHeading, setTempHeading] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Normalize both URL category and story category for comparison
  const normalizeCategory = (cat) => cat.toLowerCase().replace(/-/g, ' ');
  
  // Filter stories by category (case insensitive and handles hyphens vs spaces)
  const categoryStories = stories.filter(
    story => normalizeCategory(story.category) === normalizeCategory(category)
  );

  // Find the category object for custom metadata
  const currentCategory = categories.find(
    cat => normalizeCategory(cat.name) === normalizeCategory(category)
  );

  // Use custom heading or default
  const defaultHeading = `${currentCategory?.name || category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Stories`;
  const displayHeading = currentCategory?.customHeading || defaultHeading;
  const displayDescription = currentCategory?.customDescription;

  const startEditing = () => {
    setTempHeading(currentCategory?.customHeading || defaultHeading);
    setTempDescription(currentCategory?.customDescription || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEdits = async () => {
    if (!currentCategory) return;
    setIsSaving(true);
    const newHeading = tempHeading === defaultHeading ? '' : tempHeading;
    const newDescription = tempDescription;
    await updateCategoryMetadata(currentCategory.name, { 
      customHeading: newHeading, 
      customDescription: newDescription 
    });
    setIsEditing(false);
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky category name */}
      <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur-sm py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={tempHeading}
                  onChange={(e) => setTempHeading(e.target.value)}
                  className="w-full text-3xl sm:text-4xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Enter category description"
                  className="w-full text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-indigo-500 resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdits}
                    disabled={isSaving}
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {displayHeading}
                </h1>
                {displayDescription && (
                  <p className="text-gray-600 mt-1">{displayDescription}</p>
                )}
              </div>
            )}
          </div>
          {user?.role === 'admin' && !isEditing && (
            <button
              onClick={startEditing}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 transition-colors shrink-0"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {categoryStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryStories.map((story) => (
              <StoryCard key={story.firebaseId} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No stories found in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
