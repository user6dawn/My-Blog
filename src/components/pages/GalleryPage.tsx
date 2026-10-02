import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import '@/styles/styles.css';

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

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

  const close = useCallback(() => setSelectedIndex(null), []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setSelectedIndex((prev) =>
        prev === null || images.length === 0 ? prev : (prev + dir + images.length) % images.length
      );
    },
    [images.length]
  );

  // Keyboard controls + scroll lock while the viewer is open
  useEffect(() => {
    if (selectedIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedIndex, close, step]);

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="h-16 w-64 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-10" />
          <div className="h-[360px] md:h-[460px] w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-16" />
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {[260, 340, 220, 300, 380, 240].map((h, i) => (
              <div
                key={i}
                style={{ height: h }}
                className="mb-4 break-inside-avoid rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 md:py-16">
        {/* Header */}
        <header className="mb-10 md:mb-14 max-w-3xl">
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.95] text-zinc-950 dark:text-white">
            Gallery
          </h1>
          {images.length > 0 && (
            <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
            </p>
          )}
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-10 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          >
            <p className="font-semibold">The gallery didn't load.</p>
            <p className="text-sm mt-1 opacity-90">{error}. Refresh the page to try again.</p>
          </div>
        )}

        {/* All images */}
        {images.length === 0 && !error ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 py-20 text-center">
            <p className="text-xl font-semibold text-zinc-900 dark:text-white">Nothing here yet</p>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Add images to the gallery table and they'll show up here.
            </p>
          </div>
        ) : (
          images.length > 0 && (
            <section aria-label="All images">
              <div className="flex items-baseline justify-between mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  All work
                </h2>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {images.length} {images.length === 1 ? 'image' : 'images'}
                </span>
              </div>

              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`Open ${image.title}`}
                    className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950"
                  >
                    <img
                      src={image.image_url}
                      alt={image.title}
                      loading="lazy"
                      className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 pb-4 pt-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                      <span className="block translate-y-2 text-base font-semibold text-white transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                        {image.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )
        )}
      </div>

      {/* Viewer */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
          className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-4 md:px-8 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-sm text-white/70">
              {(selectedIndex ?? 0) + 1} of {images.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close viewer"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            >
              Close
            </button>
          </div>

          {/* Image */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous image"
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
              >
                &#8592;
              </button>
            )}

            <img
              key={selectedImage.id}
              src={selectedImage.image_url}
              alt={selectedImage.title}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next image"
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
              >
                &#8594;
              </button>
            )}
          </div>

          {/* Caption */}
          <div
            className="px-4 py-6 md:px-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white">{selectedImage.title}</h2>
            {selectedImage.description && (
              <p className="mx-auto mt-2 max-w-xl text-sm text-white/70">
                {selectedImage.description}
              </p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GalleryPage;