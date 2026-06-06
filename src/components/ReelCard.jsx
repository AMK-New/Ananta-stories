import { Link } from 'react-router-dom'

const ReelCard = ({ story }) => {
  const coverImage = story.images?.[0] || story.image;
  
  return (
    <section className="relative min-h-screen w-full snap-start overflow-hidden">
      <img
        src={coverImage}
        alt={story.title}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/1200x800?text=Story+Image'; }}
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex h-full w-full items-end p-6 sm:p-10">
        <div className="max-w-2xl text-white">
          <span className="mb-3 inline-block rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold">
            {story.category}
          </span>
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">{story.title}</h2>
          <p className="mb-6 line-clamp-3 text-gray-200 sm:text-lg">
            {story.description}
          </p>
          <div className="flex gap-3">
            <Link
              to={`/story/${story.id}`}
              className="rounded-md bg-white px-5 py-2 text-sm font-semibold text-indigo-700 hover:bg-gray-100"
            >
              Read
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReelCard
