import { useParams, Link } from 'react-router-dom';
import StoryCard from '../components/StoryCard';
import { useStories } from '../context/StoryContext';
import { useAuth } from '../context/AuthContext';
import { Edit } from 'lucide-react';

const Category = () => {
  const { category } = useParams();
  const { stories, categories } = useStories();
  const { user } = useAuth();
  
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
  const displayHeading = currentCategory?.customHeading || `${currentCategory?.name || category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Stories`;
  const displayDescription = currentCategory?.customDescription;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky category name */}
      <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur-sm py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {displayHeading}
            </h1>
            {displayDescription && (
              <p className="text-gray-600 mt-1">{displayDescription}</p>
            )}
          </div>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              state={{ scrollToCategory: currentCategory?.name }}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Category
            </Link>
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
