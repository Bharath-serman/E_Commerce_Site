# Video Background Sources Guide

## Current Working Video Source
I've updated the video to use a reliable test source:
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4
```

## Alternative Free Video Sources

### 1. Google Sample Videos (Reliable)
```tsx
videoSrc="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
videoSrc="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
videoSrc="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
```

### 2. Coverr.co (Free Stock Videos)
```tsx
videoSrc="https://videos.coverr.co/videos/coverr-ocean-waves-8287/1080p.mp4"
videoSrc="https://videos.coverr.co/videos/coverr-mountain-sunrise-5679/1080p.mp4"
videoSrc="https://videos.coverr.co/videos/coverr-forest-path-8015/1080p.mp4"
```

### 3. Pixabay Free Videos
```tsx
videoSrc="https://cdn.pixabay.com/vimeo/758321749/abstract-42936.mp4?width=1920&hash=..."
videoSrc="https://cdn.pixabay.com/vimeo/886528636/nature-42936.mp4?width=1920&hash=..."
```

## Adding Your Own Video

### Option 1: Public Folder (Recommended)
1. Place your video in `public/videos/` folder
2. Update the source:
```tsx
videoSrc="/videos/your-video.mp4"
```

### Option 2: External Hosting
Use any CDN or video hosting service:
```tsx
videoSrc="https://your-cdn.com/videos/your-video.mp4"
```

## Video Requirements

### Format Support
- **MP4 (H.264)**: Best compatibility
- **WebM**: Good alternative, smaller file size
- **MOV**: Works but larger files

### Recommended Specifications
- **Resolution**: 1920x1080 (Full HD) or 3840x2160 (4K)
- **Frame Rate**: 24-30 fps
- **Bitrate**: 5-10 Mbps for HD, 20-40 Mbps for 4K
- **Duration**: 10-30 seconds (looped)
- **File Size**: Under 50MB for optimal performance

### Content Suggestions
- Abstract patterns
- Nature scenes
- Urban landscapes
- Product lifestyle shots
- Brand-related imagery

## Testing Video Playback

### Check Console for Errors
1. Open Developer Tools (F12)
2. Look for Network tab
3. Check if video loads successfully
4. Check Console for any video-related errors

### Common Issues & Solutions

#### Video Not Playing
- **Issue**: Autoplay blocked by browser
- **Solution**: Ensure video is muted (already implemented)

#### Video Loading Slow
- **Issue**: Large file size
- **Solution**: Compress video or use lower resolution

#### Video Not Looping
- **Issue**: Missing loop attribute
- **Solution**: Already implemented in component

#### CORS Issues
- **Issue**: Video hosted on different domain
- **Solution**: Use same-origin hosting or proper CORS headers

## Performance Optimization

### Multiple Quality Sources
For best performance, provide multiple versions:
```tsx
// In ResponsiveVideo component - automatically handles this
const sources = [
  "video-4k.mp4",    // 3840x2160
  "video-1080p.mp4", // 1920x1080  
  "video-720p.mp4",  // 1280x720
  "video-480p.mp4"   // 854x480
];
```

### Lazy Loading
The component automatically:
- Pauses video when not visible
- Loads video metadata only
- Uses Intersection Observer for efficiency

## Quick Test
To test if videos work, replace the current source with:
```tsx
videoSrc="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
```

This should work immediately and show a nature scene video.
