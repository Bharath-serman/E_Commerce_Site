'use client';

import { useEffect, useRef, useState } from 'react';

interface ResponsiveVideoProps {
  videoSrc: string;
  poster?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ResponsiveVideo({ 
  videoSrc, 
  poster, 
  className = "", 
  children 
}: ResponsiveVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [videoQuality, setVideoQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video quality based on device capabilities and network
    const updateVideoQuality = () => {
      const connection = (navigator as any).connection;
      const isMobile = window.innerWidth < 768;
      
      if (isMobile || (connection && connection.saveData)) {
        setVideoQuality('low');
      } else if (connection && connection.effectiveType && 
                 ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) {
        setVideoQuality('medium');
      } else {
        setVideoQuality('high');
      }
    };

    // Intersection Observer for performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    updateVideoQuality();

    // Handle resize
    const handleResize = () => {
      updateVideoQuality();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Generate video sources based on quality
  const getVideoSources = () => {
    const baseSrc = videoSrc.replace(/-uhd_.*\.mp4/, '');
    
    switch (videoQuality) {
      case 'low':
        return [
          `${baseSrc}-sd_640_360_30fps.mp4`,
          `${baseSrc}-hd_1280_720_30fps.mp4`
        ];
      case 'medium':
        return [
          `${baseSrc}-hd_1280_720_30fps.mp4`,
          `${baseSrc}-fhd_1920_1080_30fps.mp4`
        ];
      case 'high':
      default:
        return [
          `${baseSrc}-uhd_3840_2160_24fps.mp4`,
          `${baseSrc}-fhd_1920_1080_30fps.mp4`
        ];
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        autoPlay={isIntersecting}
        muted
        loop
        playsInline
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
        preload="metadata"
      >
        {getVideoSources().map((src, index) => (
          <source key={index} src={src} type="video/mp4" />
        ))}
        <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
        Your browser does not support the video tag.
      </video>
      
      {children && (
        <div className="relative z-10 h-full flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
