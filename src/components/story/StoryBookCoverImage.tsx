import React, { CSSProperties, useEffect, useMemo, useState } from 'react';

interface StoryBookCoverImageProps {
  thumbnail?: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_COVER_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMjAiIGhlaWdodD0iNDgwIiB2aWV3Qm94PSIwIDAgMzIwIDQ4MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjY3ZWVhIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSI0ODAiIGZpbGw9InVybCgjZ3JhZCkiIHJ4PSIxNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuODUpIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiPlNlbSBDYXBhPC90ZXh0Pjwvc3ZnPg==';

const baseImageStyle: CSSProperties = {
  maxWidth: '100%',
  height: '100%',
  objectFit: 'cover'
};

const sanitizeThumbnailUrl = (thumbnail?: string): string => {
  if (!thumbnail) {
    return DEFAULT_COVER_PLACEHOLDER;
  }

  const trimmed = thumbnail.trim();

  if (!trimmed || trimmed === 'N/A') {
    return DEFAULT_COVER_PLACEHOLDER;
  }

  let url = trimmed;

  if (url.startsWith('//')) {
    url = 'https:' + url;
  }

  if (url.startsWith('http://')) {
    url = 'https://' + url.slice(7);
  }

  if (url.includes('books.google.com')) {
    url = url
      .replace(/&edge=curl/g, '')
      .replace(/&zoom=\d+/g, '&zoom=0')
      .replace('zoom=1', 'zoom=0');
  }

  return url;
};

const StoryBookCoverImage: React.FC<StoryBookCoverImageProps> = ({
  thumbnail,
  alt,
  className,
  style
}) => {
  const sanitizedThumbnail = useMemo(() => sanitizeThumbnailUrl(thumbnail), [thumbnail]);
  const [imageSrc, setImageSrc] = useState<string>(sanitizedThumbnail);

  useEffect(() => {
    setImageSrc(sanitizedThumbnail);
  }, [sanitizedThumbnail]);

  const handleImageError = () => {
    setImageSrc(DEFAULT_COVER_PLACEHOLDER);
  };

  const combinedClassName = className ? className : undefined;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={combinedClassName}
      onError={handleImageError}
      style={{ ...baseImageStyle, ...style }}
    />
  );
};

export default StoryBookCoverImage;
export { sanitizeThumbnailUrl, DEFAULT_COVER_PLACEHOLDER };
