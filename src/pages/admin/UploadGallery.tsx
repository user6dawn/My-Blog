import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import { Trash2 } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  description?: string;
  created_at: string;
}

const handleGallerySubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Add session check
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    setGalleryError('You must be logged in to upload images');
    return;
  }

  if (!galleryTitle || !galleryImage) {
    setGalleryError('Title and image are required!');
    return;
  }

  setGalleryUploading(true);

  try {
    const fileExt = galleryImage.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(fileName, galleryImage);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(uploadData.path);

    const { error: insertError } = await supabase
      .from('gallery')
      .insert([{
        title: galleryTitle,
        description: galleryDescription,
        image_url: publicUrl
      }]);

    if (insertError) throw insertError;

    alert('Gallery image uploaded!');
    setGalleryTitle('');
    setGalleryDescription('');
    setGalleryImage(null);
    setGalleryImagePreview(null);
    setGalleryError(null);
  } catch (err: any) {
    console.error('Gallery upload failed:', err);
    setGalleryError(err.message || 'Failed to upload image');
  } finally {
    setGalleryUploading(false);
  }
};

const UploadGallery: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchImages();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
    }
  };

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !image) {
      setError('Title and image are required');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(uploadData.path);
      const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  setError('You must be logged in to upload images.');
  setUploading(false);
  return;
}


      const { error: insertError } = await supabase
        .from('gallery')
        .insert([{
          title,
          description,
          image_url: publicUrl
        }]);

      if (insertError) throw insertError;

      setTitle('');
      setDescription('');
      setImage(null);
      setImagePreview(null);
      fetchImages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchImages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Manage Gallery</h1>
          <div className="space-x-4">
            <Link
              to="/admin/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/gallery"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Gallery
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-gray-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-gray-700"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-4 max-h-48 rounded"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Manage Images</h2>
          {loading ? (
            <p>Loading images...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {images.map((img) => (
                    <tr key={img.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={img.image_url}
                          alt={img.title}
                          className="h-12 w-12 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{img.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteImage(img.id)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UploadGallery;