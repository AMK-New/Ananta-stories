import { createContext, useState, useContext, useEffect } from 'react';
import { stories as initialStories } from '../data/stories';

const StoryContext = createContext();

const initialContactInfo = {
  email: 'contact@anantastories.com',
  phone: '+1 (555) 000-0000',
  address: '123 Story Lane, Fiction City, FC 12345',
  description: 'Have a story to share or a question to ask? We would love to hear from you! Reach out to us through any of the channels below.'
};

export const useStories = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStories must be used within a StoryProvider');
  }
  return context;
};

export const StoryProvider = ({ children }) => {
  // Initialize stories from localStorage
  const [stories, setStories] = useState(() => {
    const savedStories = localStorage.getItem('story-app-data');
    if (savedStories) {
      let parsed = JSON.parse(savedStories);
      // Migrate old Unsplash URLs to Picsum to avoid ORB errors
      let needsUpdate = false;
      const migrated = parsed.map(story => {
        if (story.image && story.image.includes('unsplash.com')) {
          needsUpdate = true;
          return { ...story, image: `https://picsum.photos/seed/${story.id}/1200/800` };
        }
        return story;
      });
      return migrated;
    }
    return initialStories;
  });

  // Initialize contact info from localStorage
  const [contactInfo, setContactInfo] = useState(() => {
    const savedContact = localStorage.getItem('story-app-contact');
    return savedContact ? JSON.parse(savedContact) : initialContactInfo;
  });

  // Initialize visitor count from localStorage
  const [visitorCount, setVisitorCount] = useState(() => {
    const savedCount = localStorage.getItem('story-app-visitors');
    return savedCount ? parseInt(savedCount) : 0;
  });

  // Save stories to localStorage
  useEffect(() => {
    localStorage.setItem('story-app-data', JSON.stringify(stories));
  }, [stories]);

  // Save contact info to localStorage
  useEffect(() => {
    localStorage.setItem('story-app-contact', JSON.stringify(contactInfo));
  }, [contactInfo]);

  // Save visitor count to localStorage
  useEffect(() => {
    localStorage.setItem('story-app-visitors', visitorCount.toString());
  }, [visitorCount]);

  const addStory = (newStory) => {
    setStories(prev => [
      ...prev, 
      { ...newStory, id: Date.now() }
    ]);
  };

  const updateStory = (id, updatedData) => {
    setStories(prev => prev.map(story => 
      story.id === id ? { ...story, ...updatedData } : story
    ));
  };

  const deleteStory = (id) => {
    setStories(prev => prev.filter(story => story.id !== id));
  };

  const getStory = (id) => {
    return stories.find(s => s.id === parseInt(id));
  };

  const updateContactInfo = (newInfo) => {
    setContactInfo(newInfo);
  };

  const incrementVisitors = () => {
    setVisitorCount(prev => prev + 1);
  };

  return (
    <StoryContext.Provider value={{ 
      stories, 
      addStory, 
      updateStory, 
      deleteStory, 
      getStory,
      contactInfo,
      updateContactInfo,
      visitorCount,
      incrementVisitors
    }}>
      {children}
    </StoryContext.Provider>
  );
};
