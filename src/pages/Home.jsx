import Hero from '../components/Hero';
import StoryCard from '../components/StoryCard';
import { useStories } from '../context/StoryContext';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const { stories, loading } = useStories();
  
  // Helper to check if a story is cinema category
  const isCinemaStory = (story) => {
    const cat = story.category.toLowerCase();
    return cat.includes('cinema') || cat.includes('cine');
  };
  
  // Filter out cinema stories
  const nonCinemaStories = stories.filter(story => !isCinemaStory(story));
  
  // Filter cinema stories
  const cinemaStories = stories.filter(story => isCinemaStory(story));
  
  // Popular stories: sorted by likes descending, exclude cinema
  const popularStories = [...nonCinemaStories].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  
  // Use first 3 non-cinema stories for Hero section
  const heroStories = nonCinemaStories.slice(0, 3);

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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Latest Stories Section - No Cinema */}
        {nonCinemaStories.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
              Latest Stories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {nonCinemaStories.map((story) => (
                <StoryCard key={story.firebaseId} story={story} />
              ))}
            </div>
          </section>
        )}
        
        {/* Popular Stories Section - Most Liked, No Cinema */}
        {popularStories.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
              Popular Stories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularStories.slice(0, 6).map((story) => (
                <StoryCard key={story.firebaseId} story={story} />
              ))}
            </div>
          </section>
        )}
        
        {/* Cinema Updates Section */}
        {cinemaStories.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
              Cinema Updates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {cinemaStories.map((story) => (
                <StoryCard key={story.firebaseId} story={story} />
              ))}
            </div>
          </section>
        )}
        
        {/* If no stories at all */}
        {stories.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-xl text-gray-500">No stories found. Add some in the admin panel!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
