import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { StoryProvider } from './context/StoryContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Category from './pages/Category';
import StoryDetail from './pages/StoryDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminEditor from './pages/AdminEditor';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Reels from './pages/Reels';
import Contact from './pages/Contact';
import { useStories } from './context/StoryContext';
import { useEffect } from 'react';

// Wrapper component to handle visitor tracking
const AppContent = () => {
  const { incrementVisitors } = useStories();

  useEffect(() => {
    // Only increment once per session
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
      incrementVisitors();
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/story/:id" element={<StoryDetail />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/reels" 
            element={
              <ProtectedRoute>
                <Reels />
              </ProtectedRoute>
            } 
          />
          <Route path="/contact" element={<Contact />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/new" 
            element={
              <ProtectedRoute>
                <AdminEditor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/edit/:id" 
            element={
              <ProtectedRoute>
                <AdminEditor />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Ananta Stories. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
              Contact Us
            </Link>
            <Link to="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <StoryProvider>
        <Router>
          <AppContent />
        </Router>
      </StoryProvider>
    </AuthProvider>
  );
}

export default App;
