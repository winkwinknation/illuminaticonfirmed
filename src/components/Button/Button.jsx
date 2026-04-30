import React from 'react';
import './Button.css';

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...rest
}) => {
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim();
  return (
    <button className={cls} {...rest}>
      <span className="btn__inner">{children}</span>
    </button>
  );
};
