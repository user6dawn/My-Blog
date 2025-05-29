import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  description?: string;
}

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse text-xl">Loading gallery...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center mb-12">
          <h1 className="text-6xl font-extrabold text-black dark:text-white">GALLERY</h1>
          {images.length > 0 && (
            <div className="w-full h-64 lg:h-80 rounded overflow-hidden shadow-lg transition-all duration-500">
              <img
                src={images[activeIndex]?.image_url}
                alt="Rotating banner"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Gallery Grid */}
        {images.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">No images in the gallery yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative cursor-pointer overflow-hidden rounded shadow-md transition-transform duration-300 hover:scale-105"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-[4/3] bg-white dark:bg-zinc-900 flex items-center justify-center">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Title Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white">
                  <div className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out text-center px-4">
                    <span className="text-lg font-semibold">{image.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-auto"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[70vh] object-contain rounded"
            />
            <h2 className="text-xl font-bold mt-4 text-gray-800 dark:text-white text-center">
              {selectedImage.title}
            </h2>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GalleryPage;
