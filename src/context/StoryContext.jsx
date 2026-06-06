import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { stories as initialStories } from '../data/stories';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  setDoc,
  getDoc,
  increment
} from 'firebase/firestore';

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
  const [stories, setStories] = useState([]);
  const [contactInfo, setContactInfo] = useState(initialContactInfo);
  const [visitorCount, setVisitorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasSeeded, setHasSeeded] = useState(false);

  // Real-time listener for stories
  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("id", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const storiesArray = [];
      const seenFirebaseIds = new Set();
      
      querySnapshot.forEach((doc) => {
        const story = { ...doc.data(), firebaseId: doc.id };
        // Ensure no duplicates by checking firebaseId
        if (!seenFirebaseIds.has(story.firebaseId)) {
          storiesArray.push(story);
          seenFirebaseIds.add(story.firebaseId);
        }
      });
      
      console.log(`Fetched ${storiesArray.length} unique stories from Firestore`);
      storiesArray.forEach((story, idx) => {
        console.log(`  Story ${idx + 1}: id=${story.id}, firebaseId=${story.firebaseId}, title="${story.title}"`);
      });
      
      // If no stories in Firebase and we haven't seeded yet, seed them
      if (storiesArray.length === 0 && !hasSeeded) {
        console.log("No stories found, starting seeding...");
        seedInitialData();
        setHasSeeded(true);
      } else {
        setStories(storiesArray);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hasSeeded]);

  // Real-time listener for contact info and visitors
  useEffect(() => {
    const unsubContact = onSnapshot(doc(db, "settings", "contact"), (doc) => {
      if (doc.exists()) {
        setContactInfo(doc.data());
      } else {
        // Seed initial contact info if it doesn't exist
        setDoc(doc.ref, initialContactInfo);
      }
    });

    const unsubStats = onSnapshot(doc(db, "settings", "stats"), (doc) => {
      if (doc.exists()) {
        setVisitorCount(doc.data().visitorCount || 0);
      } else {
        // Seed initial stats if it doesn't exist
        setDoc(doc.ref, { visitorCount: 0 });
      }
    });

    return () => {
      unsubContact();
      unsubStats();
    };
  }, []);

  const seedInitialData = async () => {
    console.log("Seeding initial stories to Firebase...");
    try {
      for (const story of initialStories) {
        await addDoc(collection(db, "stories"), story);
      }
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  };

  const addStory = useCallback(async (newStory) => {
    try {
      await addDoc(collection(db, "stories"), {
        ...newStory,
        id: Date.now(), // Still keep numeric ID for sorting
        createdAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error("Error adding story: ", error);
      return { success: false, error: error.message };
    }
  }, []);

  const updateStory = useCallback(async (id, updatedData) => {
    try {
      // Find the document with the matching numeric ID
      const storyToUpdate = stories.find(s => s.id === id);
      if (storyToUpdate && storyToUpdate.firebaseId) {
        const storyRef = doc(db, "stories", storyToUpdate.firebaseId);
        
        // Remove firebaseId from the data being sent to Firestore
        const { firebaseId, ...dataToSave } = updatedData;
        
        await updateDoc(storyRef, dataToSave);
        return { success: true };
      }
      return { success: false, error: "Story not found" };
    } catch (error) {
      console.error("Error updating story: ", error);
      return { success: false, error: error.message };
    }
  }, [stories]);

  const deleteStory = useCallback(async (id) => {
    try {
      const storyToDelete = stories.find(s => s.id === id);
      if (storyToDelete && storyToDelete.firebaseId) {
        await deleteDoc(doc(db, "stories", storyToDelete.firebaseId));
        return { success: true };
      }
      return { success: false, error: "Story not found" };
    } catch (error) {
      console.error("Error deleting story: ", error);
      return { success: false, error: error.message };
    }
  }, [stories]);

  const getStory = useCallback((id) => {
    return stories.find(s => s.id === parseInt(id));
  }, [stories]);

  const toggleLike = useCallback(async (storyId) => {
    try {
      const storyToLike = stories.find(s => s.id === storyId);
      if (storyToLike && storyToLike.firebaseId) {
        const storyRef = doc(db, "stories", storyToLike.firebaseId);
        
        // Check if user has already liked this story
        const likedStories = JSON.parse(localStorage.getItem('likedStories') || '[]');
        const hasLiked = likedStories.includes(storyId);
        
        if (hasLiked) {
          // Unlike: decrement count and remove from likedStories
          await updateDoc(storyRef, {
            likes: Math.max((storyToLike.likes || 0) - 1, 0)
          });
          const newLikedStories = likedStories.filter(id => id !== storyId);
          localStorage.setItem('likedStories', JSON.stringify(newLikedStories));
        } else {
          // Like: increment count and add to likedStories
          await updateDoc(storyRef, {
            likes: (storyToLike.likes || 0) + 1
          });
          localStorage.setItem('likedStories', JSON.stringify([...likedStories, storyId]));
        }
        
        return { success: true };
      }
      return { success: false, error: "Story not found" };
    } catch (error) {
      console.error("Error liking story: ", error);
      return { success: false, error: error.message };
    }
  }, [stories]);

  const incrementViewCount = useCallback(async (storyId) => {
    try {
      // Check if user has already viewed this story
      const viewedStories = JSON.parse(localStorage.getItem('viewedStories') || '[]');
      if (viewedStories.includes(storyId)) {
        return { success: true }; // Already counted, no change
      }

      const storyToView = stories.find(s => s.id === storyId);
      if (storyToView && storyToView.firebaseId) {
        const storyRef = doc(db, "stories", storyToView.firebaseId);
        
        await updateDoc(storyRef, {
          views: (storyToView.views || 0) + 1
        });
        
        // Add to viewed stories
        localStorage.setItem('viewedStories', JSON.stringify([...viewedStories, storyId]));
        
        return { success: true };
      }
      return { success: false, error: "Story not found" };
    } catch (error) {
      console.error("Error incrementing view count: ", error);
      return { success: false, error: error.message };
    }
  }, [stories]);

  const updateContactInfo = useCallback(async (newInfo) => {
    try {
      await setDoc(doc(db, "settings", "contact"), newInfo);
      return { success: true };
    } catch (error) {
      console.error("Error updating contact info: ", error);
      return { success: false, error: error.message };
    }
  }, []);

  const incrementVisitors = useCallback(async () => {
    try {
      const statsRef = doc(db, "settings", "stats");
      await updateDoc(statsRef, {
        visitorCount: increment(1)
      });
    } catch (error) {
      // If update fails (doc might not exist), try setDoc
      await setDoc(doc(db, "settings", "stats"), { visitorCount: 1 }, { merge: true });
    }
  }, []);

  const importData = useCallback(async (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data)) {
        // Warning: This will add all imported stories to Firebase
        for (const story of data) {
          const { firebaseId, ...storyToImport } = story;
          await addDoc(collection(db, "stories"), storyToImport);
        }
        return { success: true, message: 'Stories imported to Firebase successfully!' };
      }
      return { success: false, message: 'Invalid data format.' };
    } catch (error) {
      return { success: false, message: 'Import failed.' };
    }
  }, []);

  const cleanupDuplicateStories = useCallback(async () => {
    try {
      console.log("Starting duplicate story cleanup...");
      const q = query(collection(db, "stories"), orderBy("id", "desc"));
      const querySnapshot = await getDocs(q);
      
      const seenIds = new Set();
      const duplicates = [];
      
      querySnapshot.forEach((doc) => {
        const story = doc.data();
        if (seenIds.has(story.id)) {
          duplicates.push(doc.id); // firebaseId of duplicate
        } else {
          seenIds.add(story.id);
        }
      });
      
      console.log(`Found ${duplicates.length} duplicates to delete`);
      
      // Delete duplicates
      for (const firebaseId of duplicates) {
        console.log(`  Deleting duplicate: ${firebaseId}`);
        await deleteDoc(doc(db, "stories", firebaseId));
      }
      
      return { success: true, message: `Cleaned up ${duplicates.length} duplicate stories!` };
    } catch (error) {
      console.error("Error cleaning up duplicates:", error);
      return { success: false, message: "Failed to clean up duplicates" };
    }
  }, []);

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
      incrementVisitors,
      importData,
      loading,
      cleanupDuplicateStories,
      toggleLike,
      incrementViewCount
    }}>
      {children}
    </StoryContext.Provider>
  );
};