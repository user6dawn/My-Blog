import React, { useState } from 'react';

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  description?: string;
}

interface GalleryCardProps {
  image: GalleryImage;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ image }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative overflow-hidden rounded-lg shadow-lg aspect-square"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={image.image_url}
        alt={image.title}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
      />
      
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex items-end transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-white">
          <h3 className="text-lg font-semibold">{image.title}</h3>
          {image.description && (
            <p className="text-sm text-gray-200 mt-1">{image.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;