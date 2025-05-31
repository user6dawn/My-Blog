// pages/admin/gallery.tsx

'use client'
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import to ensure it's client-side rendered (avoids hydration errors)
const UploadGallery = dynamic(() => import('@/components/pages/admin/UploadGallery'), { ssr: false });

export default function AdminGalleryPage() {
  return <UploadGallery />;
}
