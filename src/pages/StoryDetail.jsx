import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Check } from 'lucide-react';
import { useStories } from '../context/StoryContext';
import { useState } from 'react';

const StoryDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { getStory, toggleLike } = useStories();
  const [copying, setCopying] = useState(false);
  
  const story = getStory(id);
  const storyId = story?.id;
  
  // Check if user has liked this story
  const likedStories = JSON.parse(localStorage.getItem('likedStories') || '[]');
  const hasLiked = storyId ? likedStories.includes(storyId) : false;
  const likeCount = story?.likes || 0;

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

  const images = story.images?.length > 0 ? story.images : (story.image ? [story.image] : []);
  const coverImage = images[0];

  // Get the full URL to share
  const shareUrl = `${window.location.origin}${location.pathname}`;

  const handleCopy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL: ", error);
      setCopying(false);
    }
  };

  const handleLike = async () => {
    if (storyId) {
      await toggleLike(storyId);
    }
  };

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="relative h-96 w-full">
        <img 
          src={coverImage} 
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
        
        {/* Like and Share Buttons */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              hasLiked 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`h-5 w-5 ${hasLiked ? 'fill-red-600' : ''}`} />
            <span className="font-medium">{likeCount}</span>
          </button>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            {copying ? <Check className="h-5 w-5 text-green-600" /> : <Share2 className="h-5 w-5" />}
            <span className="font-medium">{copying ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
        
        {/* Show all images if there are multiple */}
        {images.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${story.title} - Image ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg shadow-md"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600?text=Story+Image'; }}
              />
            ))}
          </div>
        )}
        
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
