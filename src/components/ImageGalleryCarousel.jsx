import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

export const ImageLightbox = ({ images, startIndex = 0, open, onClose }) => {
  const [index, setIndex] = useState(startIndex);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      setIndex(startIndex);
      setLoaded(false);
    }
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') setIndex((i) => (images.length + i - 1) % images.length);
      else if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, images.length, onClose]);

  if (!open || images.length === 0) return null;
  const current = images[index];
  const canNav = images.length > 1;

  const prev = (e) => {
    e?.stopPropagation();
    setIndex((i) => (images.length + i - 1) % images.length);
    setLoaded(false);
  };
  const next = (e) => {
    e?.stopPropagation();
    setIndex((i) => (i + 1) % images.length);
    setLoaded(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close image viewer"
        className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-sm transition"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <X className="h-6 w-6" />
      </button>

      {canNav && (
        <button
          type="button"
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition"
          onClick={prev}
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      <div
        className="relative max-w-screen-xl max-h-[90vh] w-[92vw] mx-8 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <Loader2 className="h-10 w-10 animate-spin text-white/80" />
          </div>
        )}
        <img
          src={current.src}
          alt={current.alt || `Image ${index + 1}`}
          onLoad={() => setLoaded(true)}
          className={`max-w-full max-h-[88vh] object-contain rounded-md shadow-2xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          draggable={false}
        />
      </div>

      {canNav && (
        <button
          type="button"
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition"
          onClick={next}
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {canNav && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-1.5 px-4">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ImageGalleryCarousel = ({ images, onOpenImage }) => {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);

  const count = images.length;
  useEffect(() => { setIndex(0); }, [images]);

  const goTo = (i) => {
    const clamped = (count + i) % count;
    setIndex(clamped);
    const track = trackRef.current;
    if (track) {
      const slide = track.children[clamped];
      slide?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  const onWheel = (e) => {
    const track = trackRef.current;
    if (!track) return;
    clearTimeout(onWheel._t);
    onWheel._t = setTimeout(() => {
      const w = track.clientWidth;
      const newIndex = Math.round(track.scrollLeft / w);
      setIndex(newIndex);
    }, 100);
  };

  if (count === 0) return null;

  // For 1-3 images, show side-by-side grid
  if (count <= 3) {
    return (
      <div className={`my-8 grid gap-4 ${
        count === 1 ? 'grid-cols-1' : 
        count === 2 ? 'grid-cols-2' : 
        'grid-cols-2 md:grid-cols-3'
      }`}>
        {images.map((img, i) => (
          <div 
            key={i} 
            className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shadow-sm ring-1 ring-gray-200 group cursor-zoom-in"
            onClick={() => onOpenImage?.(i)}
          >
            <img
              src={img.src}
              alt={img.alt || `Gallery image ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x800?text=Image+Not+Found'; }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-white/90 text-gray-900 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">View Full Image</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // For > 3 images, show carousel
  const canNav = count > 1;

  return (
    <div className="my-8 rounded-2xl overflow-hidden bg-gray-100 shadow-sm ring-1 ring-gray-200">
      <div className="relative">
        {canNav && (
          <button
            type="button"
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition"
            onClick={() => goTo(index - 1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
          onScroll={onWheel}
          onWheel={onWheel}
        >
          {images.map((img, i) => (
            <figure
              key={i}
              className="min-w-full snap-center flex items-center justify-center bg-black/5 relative"
            >
              <button
                type="button"
                className="group block w-full cursor-zoom-in"
                onClick={() => onOpenImage?.(i)}
              >
                <img
                  src={img.src}
                  alt={img.alt || `Gallery image ${i + 1}`}
                  loading="lazy"
                  className="w-full h-[450px] md:h-[600px] object-contain bg-gradient-to-br from-gray-50 to-gray-100 transition-transform duration-300 group-hover:scale-[1.01]"
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x800?text=Gallery+Image'; }}
                />
              </button>
            </figure>
          ))}
        </div>

        {canNav && (
          <button
            type="button"
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition"
            onClick={() => goTo(index + 1)}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {canNav && (
        <div className="flex items-center justify-center gap-2 py-3 bg-white">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              className={`rounded-full transition-all ${i === index ? 'h-2 w-6 bg-indigo-600' : 'h-2 w-2 bg-gray-300 hover:bg-gray-400'}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGalleryCarousel;
