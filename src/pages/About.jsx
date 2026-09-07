import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStories } from '../context/StoryContext';
import { ArrowLeft, BookOpen, Heart } from 'lucide-react';

const About = () => {
  const { aboutInfo } = useStories();
  const bodyRef = useRef(null);

  useEffect(() => {
    const node = bodyRef.current;
    if (!node) return;
    node.querySelectorAll('a[href]').forEach((a) => {
      if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
      if (!a.getAttribute('rel')) a.setAttribute('rel', 'noopener noreferrer');
    });
  }, [aboutInfo?.body]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-72 md:h-96 w-full bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 overflow-hidden">
        {aboutInfo.image && (
          <img
            src={aboutInfo.image}
            alt={aboutInfo.title}
            className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity"
            onError={(e) => { e.currentTarget.remove(); }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/0 to-black/40"></div>
        <div className="absolute inset-0 flex items-end pb-12">
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 text-white">
            <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs font-medium text-white mb-3 ring-1 ring-white/20">
              <BookOpen className="h-3.5 w-3.5" />
              About Us
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow">
              {aboutInfo.title || 'About Ananta Stories'}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-lg ring-1 ring-gray-100 p-8 md:p-12">
          {aboutInfo.image && (
            <div className="mb-8 -mt-2 -mx-2 md:mx-0">
              <img
                src={aboutInfo.image}
                alt={aboutInfo.title}
                className="w-full h-56 md:h-80 object-cover rounded-2xl shadow-md ring-1 ring-gray-100"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}

          <div
            ref={bodyRef}
            className="prose prose-lg prose-indigo max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: aboutInfo.body }}
          />

          <div className="mt-12 pt-8 border-t border-gray-100 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-indigo-50 p-5 text-indigo-900 ring-1 ring-indigo-100">
              <div className="text-sm font-semibold text-indigo-600">Made with</div>
              <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                care for readers
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 text-emerald-900 ring-1 ring-emerald-100">
              <div className="text-sm font-semibold text-emerald-600">Stories</div>
              <div className="mt-2 text-lg font-semibold">Across multiple genres</div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5 text-amber-900 ring-1 ring-amber-100">
              <div className="text-sm font-semibold text-amber-600">Questions?</div>
              <div className="mt-2">
                <Link to="/contact" className="text-lg font-semibold text-amber-800 hover:underline">
                  Contact our team →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
