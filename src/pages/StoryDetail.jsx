import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Check, Eye } from 'lucide-react';
import { useStories } from '../context/StoryContext';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ImageGalleryCarousel, ImageLightbox } from '../components/ImageGalleryCarousel';

const StoryDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { getStory, toggleLike, incrementViewCount, stories, loading } = useStories();
  const { user } = useAuth();
  const [copying, setCopying] = useState(false);

  const story = useMemo(() => getStory(id), [getStory, id, stories]);
  const firebaseId = story?.firebaseId;

  // Filter related stories (same category, excluding current)
  const relatedStories = useMemo(() => {
    if (!story) return [];
    return stories
      .filter(s => s.category === story.category && s.id !== story.id)
      .slice(0, 5);
  }, [stories, story]);

  const images = story?.images?.length > 0 ? story.images : (story?.image ? [story.image] : []);
  const coverImage = images[0];
  const shareUrl = `${window.location.origin}${location.pathname}`;

  const likedStories = JSON.parse(localStorage.getItem('likedStories') || '[]');
  const hasLiked = firebaseId ? likedStories.includes(firebaseId) : false;
  const likeCount = story?.likes || 0;
  const viewCount = story?.views || 0;

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);

  const contentRef = useRef(null);
  const [galleryImages, setGalleryImages] = useState([]);

  const coverImagesSet = useMemo(() => {
    if (!story) return [];
    return images.map((img, i) => ({ src: img, alt: `${story.title} - Image ${i + 1}` }));
  }, [images, story?.title]);

  useEffect(() => {
    if (firebaseId && !user?.isAdmin) {
      incrementViewCount(firebaseId);
    }
  }, [firebaseId, incrementViewCount, user]);

  // Post-process the Full Content HTML:
  // 1. Ensure all links open in new tab with rel=noopener
  // 2. Collect all images into a gallery and replace them with the carousel component.
  useEffect(() => {
    const node = contentRef.current;
    if (!story?.content) {
      setGalleryImages([]);
      return;
    }

    // Apply target=_blank + rel to all anchors already in DOM (from dangerouslySetInnerHTML)
    if (node) {
      node.querySelectorAll('a[href]').forEach((a) => {
        if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
        if (!a.getAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
      });
    }

    // Use DOMParser to extract images from the HTML string directly.
    // This is more reliable than querying the live DOM which might be hidden or not yet ready.
    const parser = new DOMParser();
    const doc = parser.parseFromString(story.content, 'text/html');
    const imgs = Array.from(doc.querySelectorAll('img'));

    if (imgs.length === 0) {
      setGalleryImages([]);
      return;
    }

    const collected = imgs.map((img) => ({
      src: img.getAttribute('src') || img.src,
      alt: img.getAttribute('alt') || img.alt || '',
    }));
    
    setGalleryImages(collected);
  }, [story?.content, story?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Story not found</h2>
          <p className="text-gray-600 mb-8 text-lg">The story you're looking for might have been moved or deleted.</p>
          <Link to="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

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
    if (firebaseId) {
      await toggleLike(firebaseId);
    }
  };

  const openLightbox = (i, imageSet) => {
    setLightboxImages(imageSet);
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  return (
    <article className="min-h-screen bg-white">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          to="/" 
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar - Related Stories */}
          <aside className="w-full lg:w-1/4 order-2 lg:order-1">
            <div className="sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1.5 h-6 bg-indigo-600 mr-3 rounded-full"></span>
                Related Stories
              </h3>
              {relatedStories.length > 0 ? (
                <div className="space-y-6">
                  {relatedStories.map((s) => (
                    <Link 
                      key={s.id} 
                      to={`/story/${s.id}`}
                      className="group block"
                    >
                      <div className="aspect-video w-full rounded-lg overflow-hidden mb-3 bg-gray-100">
                        <img 
                          src={s.images?.[0] || s.image} 
                          alt={s.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {s.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No other stories in this category yet.</p>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="w-full lg:w-3/4 order-1 lg:order-2">
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
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
                <Eye className="h-5 w-5" />
                <span className="font-medium">{viewCount}</span>
              </div>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                {copying ? <Check className="h-5 w-5 text-green-600" /> : <Share2 className="h-5 w-5" />}
                <span className="font-medium">{copying ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
            
            {images.length > 1 && (
              <ImageGalleryCarousel
                images={coverImagesSet}
                onOpenImage={(i) => openLightbox(i, coverImagesSet)}
              />
            )}
            
            <div className="prose prose-lg prose-indigo w-full text-gray-800 leading-relaxed">
              <div 
                className="text-xl font-medium text-gray-600 mb-8 border-l-4 border-indigo-500 pl-4 italic"
                dangerouslySetInnerHTML={{ __html: story.description }}
              />

              {/* In-content gallery: Now follows the 1-3 grid vs 4+ carousel logic */}
              {galleryImages.length > 0 && (
                <ImageGalleryCarousel
                  images={galleryImages}
                  onOpenImage={(i) => openLightbox(i, galleryImages)}
                />
              )}

              <div 
                ref={contentRef}
                className="content-images-hidden"
                dangerouslySetInnerHTML={{ __html: story.content }}
              />
            </div>
          </div>
        </div>
      </div>

      <ImageLightbox
        images={lightboxImages}
        startIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </article>
  );
};

export default StoryDetail;
