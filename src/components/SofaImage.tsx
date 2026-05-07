import { useState } from 'react';
import { sofaTeamLogo, sofaPlayerPhoto, sofaTournamentLogo, cloudinaryTeamLogo, cloudinaryPlayerPhoto, cloudinaryTournamentLogo, cacheSofaImage } from '@/utils/sofascoreImages';

type SofaImageType = 'team' | 'player' | 'tournament';

interface SofaImageProps {
  type: SofaImageType;
  id: number | string;
  theme?: 'dark' | 'light';
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
  onError?: () => void;
}

const getSofaUrl = (type: SofaImageType, id: number | string, theme?: 'dark' | 'light') => {
  if (type === 'team') return sofaTeamLogo(id);
  if (type === 'player') return sofaPlayerPhoto(id);
  return sofaTournamentLogo(id, theme ?? 'dark');
};

const getCloudinaryUrl = (type: SofaImageType, id: number | string, theme?: 'dark' | 'light') => {
  if (type === 'team') return cloudinaryTeamLogo(id);
  if (type === 'player') return cloudinaryPlayerPhoto(id);
  return cloudinaryTournamentLogo(id, theme ?? 'dark');
};

/**
 * Smart image component for Sofascore images.
 * 1. Loads from Sofascore directly (browser not blocked)
 * 2. On success: triggers background cache to Cloudinary
 * 3. On error: falls back to Cloudinary cached URL
 * 4. If both fail: renders fallback node (or nothing)
 */
export default function SofaImage({ type, id, theme, alt = '', className, fallback, onError }: SofaImageProps) {
  const [src, setSrc] = useState(() => getSofaUrl(type, id, theme));
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback ?? null}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onLoad={() => cacheSofaImage(type, id, theme)}
      onError={() => {
        const cloudUrl = getCloudinaryUrl(type, id, theme);
        if (src !== cloudUrl) {
          // Try Cloudinary fallback once
          setSrc(cloudUrl);
        } else {
          setFailed(true);
          onError?.();
        }
      }}
    />
  );
}
