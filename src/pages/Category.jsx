import { useParams } from 'react-router-dom';
import StoryCard from '../components/StoryCard';
import { useStories } from '../context/StoryContext';

const Category = () => {
  const { category } = useParams();
  const { stories } = useStories();
  
  // Filter stories by category (case insensitive)
  const categoryStories = stories.filter(
    story => story.category.toLowerCase() === category.toLowerCase()
  );

  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{formattedCategory} Stories</h1>
          <p className="text-xl text-gray-600">
            Explore our collection of AI-generated {category} tales.
          </p>
        </div>
        
        {categoryStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryStories.map((story) => (
              <StoryCard key={story.id} story={story} />
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
