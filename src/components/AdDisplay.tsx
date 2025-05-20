import React, { useEffect, useState } from 'react';
import { Ad } from '../types';
import { supabase } from '../lib/supabase';

interface AdDisplayProps {
  ad: Ad | null;
  position: 'between_posts' | 'sidebar' | 'banner';
}

const AdDisplay: React.FC<AdDisplayProps> = ({ ad, position }) => {
  const [fallbackAds, setFallbackAds] = useState<Ad[]>([]);

  useEffect(() => {
    const fetchFallbackAds = async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('id, title, link_url, image_url, is_active, position, created_at') // Fetch all required fields
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fallback ads:', error);
      } else {
        console.log('Fetched fallback ads:', data);
        setFallbackAds(data || []);
      }
    };

    if (!ad) {
      fetchFallbackAds();
    }
  }, [ad]);

  useEffect(() => {
    const trackAdImpression = async (adId: string) => {
      try {
        await supabase.rpc('increment_ad_display', { ad_id: adId });
      } catch (error) {
        console.error('Error tracking ad impression:', error);
      }
    };

    if (ad?.id) {
      trackAdImpression(ad.id);
    }
  }, [ad]);

  const trackAdClick = async (adId: string) => {
    try {
      await supabase.rpc('increment_ad_clicks', { ad_id: adId });
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  // If no ad is passed as a prop, display fallback ads
  if (!ad) {
    return (
      <div className="ad-container w-full overflow-hidden py-2 text-sm text-gray-700">
        <marquee behavior="scroll" direction="left" scrollamount="6">
          {fallbackAds.length > 0 ? (
            fallbackAds.map((item) => (
              <a
                key={item.id}
                href={item.link_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackAdClick(item.id)}
                className="mx-4 hover:underline"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt="Advertisement"
                    className="max-w-full h-auto object-contain inline-block"
                  />
                ) : (
                  <span>{item.title}</span>
                )}
              </a>
            ))
          ) : (
            <span className="mx-4">Advertisement</span>
          )}
        </marquee>
      </div>
    );
  }

  // If an ad is passed, display it
  return (
    <div className={`ad-container ${position === 'sidebar' ? 'hidden md:block' : ''}`}>
      <div className="ad-content">
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackAdClick(ad.id)}
          className="block"
        >
          {ad.image_url ? (
            <img
              src={ad.image_url}
              alt="Advertisement"
              className="max-w-full h-auto object-contain inline-block"
            />
          ) : (
            <div className="p-4">
              <h3 className="font-bold">{ad.title}</h3>
              {ad.description && <p>{ad.description}</p>}
            </div>
          )}
        </a>
      </div>
    </div>
  );
};

export default AdDisplay;
