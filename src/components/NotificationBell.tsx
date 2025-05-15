import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ThemeToggle from './ThemeToggle';

interface NotificationBellProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ isDark, toggleTheme }) => {
  const [showNotificationBell, setShowNotificationBell] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [subscriberName, setSubscriberName] = useState('');
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("subscribers")
        .upsert(
          [{ name: subscriberName, email: subscriberEmail }],
          { onConflict: ['email'] }
        );

      if (error) {
        throw error;
      }

      alert("You're now subscribed!");
      setShowModal(false);
      setSubscriberEmail("");
      setSubscriberName("");
    } catch (error) {
      console.error("Supabase error:", error);
      alert("Error: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showNotificationBell) return null;

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-4 z-50">
      <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
      
      <div className="relative">
        <button 
          onClick={() => setShowModal(true)} 
          aria-label="Subscribe to Notifications" 
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Bell size={24} />
        </button>
        <button 
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center" 
          onClick={() => setShowNotificationBell(false)} 
          aria-label="Close notification bell"
        >
          <X size={12} />
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Get Notified of New Posts</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Your Name"
                value={subscriberName}
                onChange={(e) => setSubscriberName(e.target.value)}
                required
                className="modal-input"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                required
                className="modal-input"
              />
              <button type="submit" className="modal-button" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Notify Me'}
              </button>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;