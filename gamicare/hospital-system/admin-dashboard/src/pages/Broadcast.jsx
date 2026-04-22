import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaBullhorn, FaPaperPlane } from 'react-icons/fa';

const Broadcast = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter both title and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/admin/broadcast', { title, message });
      toast.success(response.data.message || 'Broadcast message sent successfully!');
      setTitle('');
      setMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaBullhorn className="text-blue-600" />
            System Broadcast
          </h1>
          <p className="text-gray-500 mt-1">Send important announcements to all registered doctors and patients.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Announcement Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all"
              placeholder="e.g., System Maintenance Update"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
              <span>Message Content</span>
              <span className="text-gray-400 text-xs">{message.length} characters</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="6"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition-all resize-y"
              placeholder="Write your broadcast message here..."
              required
            ></textarea>
            <p className="text-xs text-gray-500 mt-2">
              This message will be delivered to every user's notification box in the Gamicare system.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <FaPaperPlane />
              {isSubmitting ? 'Broadcasting...' : 'Send Broadcast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Broadcast;
