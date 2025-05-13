import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const NotificationBell: React.FC = () => {
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
    <>
      <div className="bell-wrapper">
        <button onClick={() => setShowModal(true)} aria-label="Subscribe to Notifications" className="bell-button">
          <Bell size={24} />
        </button>
        <button className="bell-close" onClick={() => setShowNotificationBell(false)} aria-label="Close notification bell">
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
    </>
  );
};

export default NotificationBell;