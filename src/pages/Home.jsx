import Hero from '../components/Hero';
import StoryCard from '../components/StoryCard';
import { useStories } from '../context/StoryContext';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const { stories, loading } = useStories();
  
  // Use first 3 stories for Hero section
  const heroStories = stories.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero stories={heroStories} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
          Latest Stories
        </h2>
        
        {stories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <StoryCard key={story.firebaseId} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-xl text-gray-500">No stories found. Add some in the admin panel!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
