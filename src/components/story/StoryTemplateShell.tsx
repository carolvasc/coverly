import React, { ReactNode } from 'react';
import { StoryTemplateType } from './types';

interface StoryTemplateShellProps {
  templateType: StoryTemplateType;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

const StoryTemplateShell: React.FC<StoryTemplateShellProps> = ({
  templateType,
  className,
  style,
  children
}) => {
  const classes = ['template-background', 'template-' + templateType];

  if (className) {
    classes.push(className);
  }

  return (
    <div className={classes.join(' ')} style={style}>
      {children}
    </div>
  );
};

export default StoryTemplateShell;
