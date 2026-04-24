import React from "react";

/**
 * Wrapper for Sofascore images.
 * Browser loads <img> directly from Sofascore without referrer issues.
 */
interface SofaImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const SofaImg: React.FC<SofaImgProps> = ({ src, onError, ...props }) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).style.display = "none";
    onError?.(e);
  };

  return (
    <img
      src={src}
      onError={handleError}
      {...props}
    />
  );
};
