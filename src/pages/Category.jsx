import { useParams } from 'react-router-dom';
import StoryCard from '../components/StoryCard';
import { useStories } from '../context/StoryContext';

const Category = () => {
  const { category } = useParams();
  const { stories } = useStories();
  
  // Normalize both URL category and story category for comparison
  const normalizeCategory = (cat) => cat.toLowerCase().replace(/-/g, ' ');
  
  // Filter stories by category (case insensitive and handles hyphens vs spaces)
  const categoryStories = stories.filter(
    story => normalizeCategory(story.category) === normalizeCategory(category)
  );

  // Format category name (replace hyphens with spaces and capitalize each word)
  const formattedCategory = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky category name */}
      <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur-sm py-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {formattedCategory} Stories
          </h1>
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
