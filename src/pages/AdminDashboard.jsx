import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStories } from '../context/StoryContext';
import { Plus, Edit, Trash2, Settings, MessageSquare, Save, BarChart3, Users, BookOpen, Download, Upload, Copy, Check } from 'lucide-react';

const AdminDashboard = () => {
  const { stories, deleteStory, contactInfo, updateContactInfo, visitorCount, importData, cleanupDuplicateStories } = useStories();
  const [activeTab, setActiveTab] = useState('stories');
  const [contactForm, setContactForm] = useState(contactInfo);
  const [saveStatus, setSaveStatus] = useState('');
  const [importJson, setImportJson] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      deleteStory(id);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    updateContactInfo(contactForm);
    setSaveStatus('Settings saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleImport = () => {
    if (window.confirm('Warning: Importing data will overwrite your current stories on this device. Continue?')) {
      const result = importData(importJson);
      setSaveStatus(result.message);
      if (result.success) setImportJson('');
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(stories, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCleanupDuplicates = async () => {
    if (!window.confirm('Are you sure you want to clean up duplicate stories?')) {
      return;
    }
    setCleaningUp(true);
    const result = await cleanupDuplicateStories();
    setSaveStatus(result.message);
    setTimeout(() => setSaveStatus(''), 5000);
    setCleaningUp(false);
  };

  const stats = [
    { name: 'Total Visitors', value: visitorCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Stories', value: stories.length, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Categories', value: [...new Set(stories.map(s => s.category))].length, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex flex-wrap gap-2 bg-white p-1 rounded-lg shadow-sm border">
            <button
              onClick={() => setActiveTab('stories')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'stories' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Stories
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'sync' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Download className="w-4 h-4 mr-2" />
              Sync Data
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'contact' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Contact Settings
            </button>
          </div>
        </div>

        {activeTab === 'stories' && (
          <div>
            <div className="flex justify-end mb-4">
              <Link
                to="/admin/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add New Story
              </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {stories.map((story) => (
          <li key={story.firebaseId}>
                    <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-full object-cover border border-gray-200"
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
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Link>
                        <button
                          onClick={() => handleDelete(story.id)}
                          className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
                {stories.length === 0 && (
                  <li className="px-4 py-12 text-center text-gray-500">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg">No stories available.</p>
                    <p className="text-sm">Start by adding one!</p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 p-3 rounded-md ${item.bg}`}>
                        <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                          <dd>
                            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Overview</h3>
              <div className="h-64 flex items-end justify-between gap-2">
                {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-indigo-100 rounded-t-md relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute inset-0 bg-indigo-600 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs text-gray-500">Day {i + 1}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 italic">
                * Traffic data is currently tracked per browser session using local storage. 
                In a production environment with a backend, this would show global unique visitors.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <Trash2 className="w-5 h-5 mr-2 text-red-600" />
                Cleanup Duplicate Stories
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                If you're seeing duplicate stories (each appearing multiple times), click below to remove extra copies.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-sm font-medium ${saveStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {saveStatus}
                </span>
                <button
                  onClick={handleCleanupDuplicates}
                  disabled={cleaningUp}
                  className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {cleaningUp ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Cleaning Up...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clean Up Duplicates
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <Download className="w-5 h-5 mr-2 text-indigo-600" />
                Export Data (Sync to Mobile)
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Since stories are saved in your browser's local memory, you need to manually move them to see updates on other devices (like your phone).
              </p>
              <div className="relative">
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-indigo-300 overflow-auto max-h-40">
                  <pre>{JSON.stringify(stories, null, 2)}</pre>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-md transition-colors"
                  title="Copy JSON to clipboard"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                1. Click the copy icon above. 2. Open the Admin Portal on your mobile. 3. Paste the code into the "Import" box below.
              </p>
            </div>

            <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-indigo-600" />
                Import Data
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Paste the JSON data from your other device here to sync your stories.
              </p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='Paste story JSON here...'
                className="w-full h-40 p-3 font-mono text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-sm font-medium ${saveStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                  {saveStatus}
                </span>
                <button
                  onClick={handleImport}
                  disabled={!importJson}
                  className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import & Overwrite
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Edit Contact Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                These details will be displayed on the public Contact Us page.
              </p>
            </div>
            <div className="px-4 py-6 sm:px-6">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Office Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={contactForm.address}
                      onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Page Description
                    </label>
                    <textarea
                      id="description"
                      rows="3"
                      value={contactForm.description}
                      onChange={(e) => setContactForm({ ...contactForm, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm font-medium text-green-600">{saveStatus}</span>
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    <Save className="-ml-1 mr-2 h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
