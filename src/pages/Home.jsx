import Hero from '../components/Hero';
import StoryCard from '../components/StoryCard';
import { useStories } from '../context/StoryContext';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

const Home = () => {
  const { stories, loading } = useStories();
  
  // Helper to check if a story is cinema category
  const isCinemaStory = (story) => {
    const cat = story.category.toLowerCase();
    return cat.includes('cinema') || cat.includes('cine');
  };
  
  // Helper to check if a story is sports category
  const isSportsStory = (story) => {
    const cat = story.category.toLowerCase();
    return cat.includes('sport');
  };
  
  // Filter out cinema stories
  const nonCinemaStories = stories.filter(story => !isCinemaStory(story));
  
  // Filter cinema stories
  const cinemaStories = stories.filter(story => isCinemaStory(story));
  
  // Filter sports stories
  const sportsStories = stories.filter(story => isSportsStory(story));
  
  // Popular stories: sorted by likes descending, exclude cinema
  const popularStories = [...nonCinemaStories].sort((a, b) => (b.likes || 0) - (a.likes || 0));
  
  // Use first 3 non-cinema stories for Hero section
  const heroStories = nonCinemaStories.slice(0, 3);

  // Carousel scroll function
  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 300; // Adjust based on card width
      if (direction === 'left') {
        ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

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

  // Carousel component
  const StoryCarousel = ({ stories, title }) => {
    const carouselRef = useRef(null);
    
    return (
      <section>
        <div className="flex items-center justify-between mb-6 border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => scrollCarousel(carouselRef, 'left')} 
              className="p-2 rounded-full bg-white shadow-sm border hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => scrollCarousel(carouselRef, 'right')} 
              className="p-2 rounded-full bg-white shadow-sm border hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div 
          ref={carouselRef} 
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
        >
          {stories.map((story) => (
            <StoryCard key={story.firebaseId} story={story} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero stories={heroStories} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Latest Stories Section - No Cinema */}
        {nonCinemaStories.length > 0 && (
          <StoryCarousel stories={nonCinemaStories} title="Latest Stories" />
        )}
        
        {/* Popular Stories Section - Most Liked, No Cinema */}
        {popularStories.length > 0 && (
          <StoryCarousel stories={popularStories} title="Popular Stories" />
        )}
        
        {/* Cinema Updates Section */}
        {cinemaStories.length > 0 && (
          <StoryCarousel stories={cinemaStories} title="Cinema Updates" />
        )}
        
        {/* Sports Section */}
        {sportsStories.length > 0 && (
          <StoryCarousel stories={sportsStories} title="Sports" />
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
