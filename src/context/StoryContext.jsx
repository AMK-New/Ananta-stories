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

const initialCategories = [
  { name: "Mystery", customHeading: "", customDescription: "" },
  { name: "Romance", customHeading: "", customDescription: "" },
  { name: "Thriller", customHeading: "", customDescription: "" },
  { name: "History", customHeading: "", customDescription: "" },
  { name: "Cine Updates", customHeading: "", customDescription: "" }
];

export const useStories = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStories must be used within a StoryProvider');
  }
  return context;
};

export const StoryProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
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

  // Real-time listener for categories
  useEffect(() => {
    const unsubCategories = onSnapshot(doc(db, "settings", "categories"), (doc) => {
      if (doc.exists()) {
        const data = doc.data().list || [];
        // Migrate string categories to objects
        const migratedData = data.map(cat => 
          typeof cat === "string" ? { name: cat, customHeading: "", customDescription: "" } : cat
        );
        setCategories(migratedData);
      } else {
        // Seed initial categories if it doesn't exist
        setDoc(doc.ref, { list: initialCategories });
      }
    });

    return () => unsubCategories();
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

  const toggleLike = useCallback(async (firebaseId) => {
    try {
      const storyToLike = stories.find(s => s.firebaseId === firebaseId);
      if (storyToLike) {
        const storyRef = doc(db, "stories", firebaseId);
        
        // Check if user has already liked this story
        const likedStories = JSON.parse(localStorage.getItem('likedStories') || '[]');
        const hasLiked = likedStories.includes(firebaseId);
        
        if (hasLiked) {
          // Unlike: decrement count and remove from likedStories
          await updateDoc(storyRef, {
            likes: Math.max((storyToLike.likes || 0) - 1, 0)
          });
          const newLikedStories = likedStories.filter(id => id !== firebaseId);
          localStorage.setItem('likedStories', JSON.stringify(newLikedStories));
        } else {
          // Like: increment count and add to likedStories
          await updateDoc(storyRef, {
            likes: (storyToLike.likes || 0) + 1
          });
          localStorage.setItem('likedStories', JSON.stringify([...likedStories, firebaseId]));
        }
        
        return { success: true };
      }
      return { success: false, error: "Story not found" };
    } catch (error) {
      console.error("Error liking story: ", error);
      return { success: false, error: error.message };
    }
  }, [stories]);

  const incrementViewCount = useCallback(async (firebaseId) => {
    try {
      // Check if user has already viewed this story
      const viewedStories = JSON.parse(localStorage.getItem('viewedStories') || '[]');
      if (viewedStories.includes(firebaseId)) {
        return { success: true }; // Already counted, no change
      }

      const storyToView = stories.find(s => s.firebaseId === firebaseId);
      if (storyToView) {
        const storyRef = doc(db, "stories", firebaseId);
        
        await updateDoc(storyRef, {
          views: (storyToView.views || 0) + 1
        });
        
        // Add to viewed stories
        localStorage.setItem('viewedStories', JSON.stringify([...viewedStories, firebaseId]));
        
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

  // Category management functions
  const addCategory = useCallback(async (categoryName) => {
    try {
      if (categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
        return { success: false, message: "Category already exists!" };
      }
      const newCategories = [...categories, { name: categoryName, customHeading: "", customDescription: "" }];
      await setDoc(doc(db, "settings", "categories"), { list: newCategories });
      return { success: true, message: "Category added successfully!" };
    } catch (error) {
      console.error("Error adding category:", error);
      return { success: false, message: "Failed to add category" };
    }
  }, [categories]);

  const editCategory = useCallback(async (oldName, newName) => {
    try {
      if (oldName === newName) {
        return { success: false, message: "Old and new category names are the same" };
      }
      if (categories.some(cat => cat.name.toLowerCase() === newName.toLowerCase())) {
        return { success: false, message: "Category with this name already exists!" };
      }

      // Update categories list
      const newCategories = categories.map(cat => 
        cat.name === oldName ? { ...cat, name: newName } : cat
      );
      await setDoc(doc(db, "settings", "categories"), { list: newCategories });

      // Update all stories with the old category name
      const storiesToUpdate = stories.filter(story => story.category === oldName);
      for (const story of storiesToUpdate) {
        const storyRef = doc(db, "stories", story.firebaseId);
        await updateDoc(storyRef, { category: newName });
      }

      return { success: true, message: `Category updated! ${storiesToUpdate.length} stories updated.` };
    } catch (error) {
      console.error("Error editing category:", error);
      return { success: false, message: "Failed to edit category" };
    }
  }, [categories, stories]);

  const updateCategoryMetadata = useCallback(async (categoryName, metadata) => {
    try {
      const newCategories = categories.map(cat => 
        cat.name === categoryName ? { ...cat, ...metadata } : cat
      );
      await setDoc(doc(db, "settings", "categories"), { list: newCategories });
      return { success: true, message: "Category metadata updated successfully!" };
    } catch (error) {
      console.error("Error updating category metadata:", error);
      return { success: false, message: "Failed to update category metadata" };
    }
  }, [categories]);

  const deleteCategory = useCallback(async (categoryName) => {
    try {
      if (categories.length <= 1) {
        return { success: false, message: "You must have at least one category!" };
      }
      const newCategories = categories.filter(cat => cat.name !== categoryName);
      await setDoc(doc(db, "settings", "categories"), { list: newCategories });
      return { success: true, message: "Category deleted successfully!" };
    } catch (error) {
      console.error("Error deleting category:", error);
      return { success: false, message: "Failed to delete category" };
    }
  }, [categories]);

  return (
    <StoryContext.Provider value={{ 
      stories, 
      categories,
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
      incrementViewCount,
      addCategory,
      editCategory,
      deleteCategory,
      updateCategoryMetadata
    }}>
      {children}
    </StoryContext.Provider>
  );
};