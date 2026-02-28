import React, { useEffect, useState } from 'react';
import { Ad } from '../types';
import { supabase } from '../lib/supabase';

interface AdDisplayProps {
  ad: Ad | null;
  position: 'between_posts' | 'sidebar' | 'banner';
}

const AdDisplay: React.FC<AdDisplayProps> = ({ ad, position }) => {
  const [fallbackAds, setFallbackAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

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

  // Rotate fallback ads every minute, infinitely
  useEffect(() => {
    if (fallbackAds.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % fallbackAds.length);
    }, 60_000); // 60 seconds

    return () => clearInterval(intervalId);
  }, [fallbackAds.length]);

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

  // If no ad is passed as a prop, display rotating fallback ads
  if (!ad) {
    const currentAd = fallbackAds[currentAdIndex];
    const nonSidebarHeight = position === 'between_posts' ? '300px' : '100px';

    return (
      <div
        className={
          position === 'sidebar'
            ? 'ad-container w-fit overflow-hidden py-2 text-sm text-gray-700'
            : 'ad-container w-full overflow-hidden py-2 text-sm text-gray-700 flex items-center justify-center'
        }
        style={position === 'sidebar' ? undefined : { height: nonSidebarHeight }}
      >
        {currentAd ? (
          <a
            key={currentAd.id}
            href={currentAd.link_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackAdClick(currentAd.id)}
            className={position === 'sidebar' ? 'inline-block' : 'block h-full mx-auto'}
          >
            {currentAd.image_url ? (
              <img
                src={currentAd.image_url}
                alt="Advertisement"
                className={
                  position === 'sidebar'
                    ? 'block w-auto h-auto'
                    : 'h-full w-auto object-cover mx-auto'
                }
                style={position === 'sidebar' ? undefined : { height: '100%' }}
              />
            ) : (
              <span className="text-base">{currentAd.title}</span>
            )}
          </a>
        ) : (
          <span className="mx-4 text-base">Advertisement</span>
        )}
      </div>
    );
  }

  // If an ad is passed, display it
  return (
    <div className="ad-container flex justify-center">
      <div
        className={
          position === 'sidebar'
            ? 'w-fit mx-auto'
            : 'w-full overflow-hidden flex items-center justify-center'
        }
        style={
          position === 'sidebar'
            ? undefined
            : { height: position === 'between_posts' ? '300px' : '100px' }
        }
      >
        <a
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackAdClick(ad.id)}
          className={position === 'sidebar' ? 'inline-block' : 'block w-full h-full'}
        >
          {ad.image_url ? (
            <img
              src={ad.image_url}
              alt="Advertisement"
              className={
                position === 'sidebar'
                  ? 'block w-auto h-auto'
                  : 'h-full w-auto object-cover'
              }
              style={position === 'sidebar' ? undefined : { height: '100%' }}
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
