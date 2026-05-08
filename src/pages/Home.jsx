import Hero from '../components/Hero';
import StoryCard from '../components/StoryCard';
import { useStories } from '../context/StoryContext';

const Home = () => {
  const { stories } = useStories();
  
  // Use first 3 stories for Hero section
  const heroStories = stories.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero stories={heroStories} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
          Latest Stories
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
