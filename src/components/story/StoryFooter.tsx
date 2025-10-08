import React from 'react';

interface StoryFooterProps {
  text: string;
  className?: string;
}

const StoryFooter: React.FC<StoryFooterProps> = ({ text, className }) => {
  const containerClassName = className ? 'template-footer ' + className : 'template-footer';

  return (
    <div className={containerClassName}>
      <span>{text}</span>
    </div>
  );
};

export default StoryFooter;
