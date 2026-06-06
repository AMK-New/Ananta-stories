import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';

const StoryCard = ({ story }) => {
  // Use first image if images array exists, else use single image
  const coverImage = story.images?.[0] || story.image;
  const likeCount = story?.likes || 0;
  const viewCount = story?.views || 0;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <img 
        src={coverImage} 
        alt={story.title} 
        className="w-full h-48 object-cover"
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600?text=Story+Image'; }}
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            {story.category}
          </span>
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{likeCount}</span>
            </div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {story.description}
        </p>
        <Link 
          to={`/story/${story.id}`}
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Read Story
        </Link>
      </div>
    </div>
  );
};

export default StoryCard;
