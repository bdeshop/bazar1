import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { toast, Toaster } from 'react-hot-toast';

const Allevent = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch events on component mount and when currentPage changes
  useEffect(() => {
    fetchEvents();
  }, [currentPage]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${base_url}/api/admin/events?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT auth
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEvents(data.data || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'completed' : 'active'; // Adjusted to match backend
      const response = await fetch(`${base_url}/api/admin/events/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT auth
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (response.ok) {
        fetchEvents();
        toast.success(data.message || 'Event status updated successfully');
      } else {
        toast.error(data.error || 'Failed to update event status');
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Error updating event status');
    }
  };

  const confirmDelete = (event) => {
    setEventToDelete(event);
    setShowDeletePopup(true);
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setEventToDelete(null);
  };

  const deleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      const response = await fetch(`${base_url}/api/admin/events/${eventToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT auth
        }
      });

      const data = await response.json();
      if (response.ok) {
        fetchEvents();
        toast.success(data.message || 'Event deleted successfully');
      } else {
        toast.error(data.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Error deleting event');
    } finally {
      setShowDeletePopup(false);
      setEventToDelete(null);
    }
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-md">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the event "{eventToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteEvent}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />

        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">All Events</h1>

            {/* Events Table */}
            <div>
              {loading && events.length === 0 ? (
                <div className="text-center py-8">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">No events found</div>
              ) : (
                <div className="overflow-x-auto border-[1px] border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-theme_color">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {event.image ? (
                              <img
                                src={`${base_url}${event.image}`}
                                alt={event.title}
                                className="h-16 w-24 rounded-md object-cover"
                                onError={(e) => (e.target.src = '/placeholder-image.jpg')} // Fallback image
                              />
                            ) : (
                              <span className="text-sm text-gray-500">No image</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{event.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {event.eventDates.map((date, index) => (
                              <div key={index} className="flex items-center">
                                {new Date(date.date).toLocaleDateString()} {date.time} (
                                {date.status.charAt(0).toUpperCase() + date.status.slice(1)})
                              </div>
                            ))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={event.status === 'active'}
                                onChange={() => toggleStatus(event._id, event.status)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              className="px-[8px] py-[7px] text-white bg-red-600 cursor-pointer rounded-[3px] text-[16px]"
                              onClick={() => confirmDelete(event)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </section>
  );
};

export default Allevent;