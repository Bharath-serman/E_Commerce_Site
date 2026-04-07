# Enhanced 4K Video Background Implementation

This document explains the video background implementation added to the e-commerce site, inspired by the cornrevolution.resn.global reference site.

## Features Implemented

### 1. **4K Video Background**
- Uses high-resolution video sources (3840x2160) for premium quality
- Automatic quality adjustment based on device capabilities and network conditions
- Multiple video formats supported (MP4, WebM)

### 2. **Advanced Scroll Animations**
- **Scale Effect**: Video scales up as user scrolls down (1.0x to 1.4x)
- **Parallax Movement**: Video moves upward while scrolling
- **Direction-based Effects**: Different animations for scroll up/down
- **Velocity Detection**: Responsive to scroll speed
- **Blur & Fade**: Gradual blur and opacity changes on scroll
- **3D Transform**: Subtle tilt effect for depth

### 3. **Performance Optimizations**
- Intersection Observer for play/pause based on visibility
- Adaptive video quality (high/medium/low) based on:
  - Device screen size
  - Network connection speed
  - Data saver preferences
- Hardware acceleration with CSS transforms
- Lazy loading and metadata preloading

### 4. **Responsive Design**
- Full viewport height hero section
- Mobile-optimized video quality
- Touch-friendly scroll indicators
- Fluid typography scaling

## Components

### VideoBackground.tsx
Main component handling:
- Scroll-based animations using custom hook
- Video loading states
- Overlay gradients for text readability
- Scroll indicators

### ResponsiveVideo.tsx
Performance-focused component:
- Automatic quality adjustment
- Intersection Observer integration
- Multiple video source support
- Network-aware streaming

### useScrollAnimation.ts
Custom React hook providing:
- Scroll position tracking
- Scroll direction detection
- Velocity calculations
- Scroll state management

## Usage

```tsx
import VideoBackground from '@/components/VideoBackground';

<VideoBackground 
  videoSrc="https://videos.pexels.com/video-files/853889/853889-uhd_3840_2160_24fps.mp4"
  className="w-full h-full"
>
  {/* Your content here */}
</VideoBackground>
```

## Video Requirements

For optimal performance, provide videos in multiple resolutions:
- **4K**: 3840x2160 (24fps for cinematic effect)
- **Full HD**: 1920x1080 (30fps)
- **HD**: 1280x720 (30fps)
- **SD**: 640x360 (30fps)

Naming convention: `filename-{resolution}_{fps}.mp4`

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Performance Notes

- Videos are paused when not visible
- Quality automatically adjusts based on network
- Hardware acceleration enabled for smooth animations
- Minimal impact on page load times due to lazy loading

## Customization

### Animation Intensity
Modify these values in `VideoBackground.tsx`:
```tsx
const scale = 1 + (scrollProgress * 0.4); // Adjust scaling
const translateY = scrollProgress * -150; // Adjust parallax movement
const blur = Math.min(scrollProgress * 2, 3); // Adjust blur intensity
```

### Video Sources
Update the quality logic in `ResponsiveVideo.tsx` to match your video hosting setup.

## Troubleshooting

### Video Not Playing
- Check video format compatibility
- Ensure autoplay is not blocked by browser
- Verify video URLs are accessible

### Performance Issues
- Lower video quality settings
- Reduce animation complexity
- Check network connection

### Mobile Responsiveness
- Video quality automatically reduces on mobile
- Touch gestures work with scroll animations
- Battery optimization considered
