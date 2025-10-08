import React from 'react';

interface StoryStarsProps {
  rating: number;
  maxStars?: number;
  className?: string;
}

const clampRating = (value: number, max: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(max, Math.floor(value)));
};

const StoryStars: React.FC<StoryStarsProps> = ({ rating, maxStars = 5, className }) => {
  const safeRating = clampRating(rating, maxStars);
  const containerClassName = className ? 'template-stars ' + className : 'template-stars';

  return (
    <div className={containerClassName}>
      {Array.from({ length: maxStars }, (_, index) => (
        <span
          key={index}
          className={'template-star ' + (index < safeRating ? 'filled' : 'empty')}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StoryStars;
