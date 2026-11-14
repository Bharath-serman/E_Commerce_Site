'use client';

import { useRef, useState } from 'react';

interface VideoBackgroundProps {
  videoSrc: string;
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

export default function VideoBackground({ 
  videoSrc, 
  children, 
  className = "",
  overlayClassName = "bg-gradient-to-t from-black/85 via-black/30 to-black/10",
  contentClassName = "flex items-end justify-center"
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onLoadStart={handleLoad}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay for better text readability */}
      <div className={`absolute inset-0 ${overlayClassName}`} />

      {/* Content */}
      <div className={`relative z-10 h-full w-full ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}
