// pages/admin.js
import { useState } from 'react';
import supabase from '../lib/supabase';

export default function Admin() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('blogs')
      .insert([{ title, content }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Blog post added successfully!');
      setTitle('');
      setContent('');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Blog Post'}
        </button>
      </form>
    </div>
  );
}
