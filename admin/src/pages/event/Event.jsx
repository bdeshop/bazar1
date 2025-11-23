import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaRegFileImage } from 'react-icons/fa';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { toast, Toaster } from 'react-hot-toast';

const Event = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDates: [{ date: '', time: '', status: 'scheduled' }],
    category: 'sports',
    status: 'active',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error('Only JPEG, JPG, PNG, or GIF images are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (index, field, value) => {
    const newDates = [...formData.eventDates];
    newDates[index][field] = value;
    setFormData({ ...formData, eventDates: newDates });
  };

  const addDateField = () => {
    setFormData({
      ...formData,
      eventDates: [...formData.eventDates, { date: '', time: '', status: 'scheduled' }]
    });
  };

  const removeDateField = (index) => {
    const newDates = formData.eventDates.filter((_, i) => i !== index);
    setFormData({ ...formData, eventDates: newDates });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return;
    }
    if (formData.eventDates.some(date => !date.date || !date.time)) {
      toast.error('Please fill all date and time fields');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('eventDates', JSON.stringify(formData.eventDates));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', formData.status);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${base_url}/api/admin/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT auth
        },
        body: formDataToSend
      });

      const data = await response.json();
      if (response.ok) {
        setFormData({
          title: '',
          description: '',
          eventDates: [{ date: '', time: '', status: 'scheduled' }],
          category: 'sports',
          status: 'active',
          image: null
        });
        setImagePreview(null);
        fetchEvents();
        toast.success(data.message || 'Event created successfully!');
      } else {
        toast.error(data.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Error creating event');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return;
    }
    if (formData.eventDates.some(date => !date.date || !date.time)) {
      toast.error('Please fill all date and time fields');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('eventDates', JSON.stringify(formData.eventDates));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('status', formData.status);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${base_url}/api/admin/events/${editingEvent._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT auth
        },
        body: formDataToSend
      });

      const data = await response.json();
      if (response.ok) {
        setEditingEvent(null);
        setFormData({
          title: '',
          description: '',
          eventDates: [{ date: '', time: '', status: 'scheduled' }],
          category: 'sports',
          status: 'active',
          image: null
        });
        setImagePreview(null);
        fetchEvents();
        toast.success(data.message || 'Event updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Error updating event');
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

  const toggleDateStatus = async (eventId, dateIndex, currentStatus) => {
    const newStatus = {
      scheduled: 'live',
      live: 'completed',
      completed: 'cancelled',
      cancelled: 'scheduled'
    }[currentStatus] || 'scheduled';

    try {
      const response = await fetch(`${base_url}/api/admin/events/${eventId}/dates/${dateIndex}/status`, {
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
        toast.success(data.message || 'Event date status updated successfully');
      } else {
        toast.error(data.error || 'Failed to update event date status');
      }
    } catch (error) {
      console.error('Error updating event date status:', error);
      toast.error('Error updating event date status');
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

  const startEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      eventDates: event.eventDates.map(date => ({
        date: date.date.split('T')[0],
        time: date.time,
        status: date.status
      })),
      category: event.category,
      status: event.status,
      image: null
    });
    setImagePreview(event.image ? `${base_url}${event.image}` : null);
  };

  const cancelEdit = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      eventDates: [{ date: '', time: '', status: 'scheduled' }],
      category: 'sports',
      status: 'active',
      image: null
    });
    setImagePreview(null);
  };

  return (
    <section className="font-nunito h-screen bg-gray-50">
      <Header toggleSidebar={toggleSidebar} />

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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Event Management</h1>

            <div className="bg-white rounded-[5px] p-6 border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <form onSubmit={editingEvent ? handleEditSubmit : handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                    placeholder="Enter event description"
                    rows="4"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Image (Optional)</label>
                  {imagePreview && (
                    <div className="mb-4">
                      <img src={imagePreview} alt="Preview" className="h-32 w-48 object-cover rounded-md" />
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaRegFileImage className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                  >
                    <option value="sports">Sports</option>
                    <option value="music">Music</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Dates</label>
                  {formData.eventDates.map((date, index) => (
                    <div key={index} className="flex items-center space-x-4 mb-4">
                      <input
                        type="date"
                        value={date.date}
                        onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                        required
                      />
                      <input
                        type="time"
                        value={date.time}
                        onChange={(e) => handleDateChange(index, 'time', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                        required
                      />
                      <select
                        value={date.status}
                        onChange={(e) => handleDateChange(index, 'status', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-[3px] outline-theme_color"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {formData.eventDates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDateField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDateField}
                    className="flex items-center text-orange-500 hover:text-orange-700"
                  >
                    <FaPlus className="mr-2" /> Add Another Date
                  </button>
                </div>

                <div className="flex justify-end mt-8 space-x-4">
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </section>
  );
};

export default Event;