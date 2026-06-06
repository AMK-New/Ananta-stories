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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{formattedCategory} Stories</h1>
          <p className="text-xl text-gray-600">
            Explore our collection of AI-generated {formattedCategory.toLowerCase()} tales.
          </p>
        </div>
        
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
