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

  // Real-time listener for stories
  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("id", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const storiesArray = [];
      const seenIds = new Set();
      
      querySnapshot.forEach((doc) => {
        const story = { ...doc.data(), firebaseId: doc.id };
        // Ensure no duplicates by checking firebaseId
        if (!seenIds.has(story.firebaseId)) {
          storiesArray.push(story);
          seenIds.add(story.firebaseId);
        }
      });
      
      console.log(`Fetched ${storiesArray.length} unique stories from Firestore`);
      
      // If no stories in Firebase, use initialStories and seed them
      if (storiesArray.length === 0 && loading) {
        seedInitialData();
      } else {
        setStories(storiesArray);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      loading
    }}>
      {children}
    </StoryContext.Provider>
  );
};