import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStories } from '../context/StoryContext';

const StoryDetail = () => {
  const { id } = useParams();
  const { getStory } = useStories();
  
  const story = getStory(id);

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Story not found</h2>
          <Link to="/" className="text-indigo-600 hover:text-indigo-500">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="relative h-96 w-full">
        <img 
          src={story.image} 
          alt={story.title} 
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x800?text=Story+Image'; }}
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <span className="inline-block px-3 py-1 bg-indigo-600 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              {story.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{story.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories
        </Link>
        
        <div className="prose prose-lg prose-indigo mx-auto text-gray-800 leading-relaxed">
          <p className="text-xl font-medium text-gray-600 mb-8 border-l-4 border-indigo-500 pl-4 italic">
            {story.description}
          </p>
          <div className="whitespace-pre-wrap">
            {story.content}
          </div>
        </div>
      </div>
    </article>
  );
};

export default StoryDetail;
