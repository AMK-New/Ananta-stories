import { createContext, useState, useContext, useEffect } from 'react';
import { stories as initialStories } from '../data/stories';

const StoryContext = createContext();

export const useStories = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStories must be used within a StoryProvider');
  }
  return context;
};

export const StoryProvider = ({ children }) => {
  // Initialize from localStorage if available, otherwise use initial data
  const [stories, setStories] = useState(() => {
    const savedStories = localStorage.getItem('story-app-data');
    return savedStories ? JSON.parse(savedStories) : initialStories;
  });

  // Save to localStorage whenever stories change
  useEffect(() => {
    localStorage.setItem('story-app-data', JSON.stringify(stories));
  }, [stories]);

  const addStory = (newStory) => {
    setStories(prev => [
      ...prev, 
      { ...newStory, id: Date.now() } // Simple ID generation
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

  return (
    <StoryContext.Provider value={{ stories, addStory, updateStory, deleteStory, getStory }}>
      {children}
    </StoryContext.Provider>
  );
};
