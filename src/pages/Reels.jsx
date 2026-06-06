import { useStories } from '../context/StoryContext'
import ReelCard from '../components/ReelCard'

const Reels = () => {
  const { stories } = useStories()

  return (
    <div className="h-screen w-full overflow-y-scroll scroll-smooth snap-y snap-mandatory">
      {stories.map((story) => (
        <ReelCard key={story.firebaseId} story={story} />
      ))}
    </div>
  )
}

export default Reels

