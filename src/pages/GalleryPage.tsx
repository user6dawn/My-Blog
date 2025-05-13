import React from 'react';
import Layout from '../components/Layout';

const GalleryPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Gallery</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon...</h2>
          <p className="text-gray-600">We're working on creating a beautiful gallery of images and videos.</p>
          <p className="text-gray-600 mt-2">Please check back later!</p>
        </div>
      </div>
    </Layout>
  );
};

export default GalleryPage;