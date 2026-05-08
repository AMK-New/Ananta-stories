import { Link } from 'react-router-dom';
import { useStories } from '../context/StoryContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const { stories, deleteStory } = useStories();

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      deleteStory(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Link
            to="/admin/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add New Story
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {stories.map((story) => (
              <li key={story.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={story.image}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="font-medium text-indigo-600 truncate">{story.title}</p>
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {story.category}
                          </span>
                        </div>
                        <div className="mt-1 flex">
                          <p className="text-sm text-gray-500 truncate max-w-md">
                            {story.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex space-x-2">
                    <Link
                      to={`/admin/edit/${story.id}`}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Link>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {stories.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                No stories available. Start by adding one!
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
