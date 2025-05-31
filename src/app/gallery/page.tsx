'use client'

// pages/admin/gallery.tsx
// pages/admin/gallery.tsx
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to ensure it's client-side rendered (avoids hydration errors)
const UploadGallery = dynamic(() => import('@/components/pages/GalleryPage'), { ssr: false });

export default function AdminGalleryPage() {
  return <UploadGallery />;
}

