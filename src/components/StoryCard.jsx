import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';

const StoryCard = ({ story }) => {
  // Use first image if images array exists, else use single image
  const coverImage = story.images?.[0] || story.image;
  const likeCount = story?.likes || 0;
  const viewCount = story?.views || 0;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 flex-shrink-0 w-72">
      <img 
        src={coverImage} 
        alt={story.title} 
        className="w-full h-36 object-cover"
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600?text=Story+Image'; }}
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            {story.category}
          </span>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{likeCount}</span>
            </div>
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{story.title}</h3>
        <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
          {story.description}
        </p>
        <Link 
          to={`/story/${story.id}`}
          className="inline-block bg-indigo-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors"
        >
          Read Story
        </Link>
      </div>
    </div>
  );
};

export default StoryCard;
