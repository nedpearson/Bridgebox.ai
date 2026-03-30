import React from "react";

export const BridgeboxLogo = ({
  className = "w-8 h-8",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) => {
  return (
    <img 
      src="/image.png" 
      alt="Bridgebox" 
      className={className} 
      style={{ objectFit: 'contain' }}
    />
  );
};
