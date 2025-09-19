import React, { useState } from 'react';
import './StarRating.css';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  maxStars = 5 
}) => {
  const [hover, setHover] = useState<number>(0);

  return (
    <div className="star-rating">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            className={`star ${starValue <= (hover || rating) ? 'filled' : 'empty'}`}
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Avaliar com ${starValue} estrela${starValue > 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
      <span className="rating-text">
        {rating > 0 ? `${rating}/5 estrelas` : 'Clique para avaliar'}
      </span>
    </div>
  );
};

export default StarRating;