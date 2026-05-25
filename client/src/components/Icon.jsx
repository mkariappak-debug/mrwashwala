import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Icon({ icon, size = 'md', color, className = '', ...rest }) {
  const cssSize = `var(--icon-${size}, 1rem)`;
  const cssColor = color ? color : 'var(--icon-color)';

  return (
    <FontAwesomeIcon
      icon={icon}
      className={className}
      style={{ fontSize: cssSize, color: cssColor }}
      {...rest}
    />
  );
}
