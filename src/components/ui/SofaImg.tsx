import { useEffect } from 'react';
import { sofaTeamLogo, sofaPlayerPhoto, sofaTournamentLogo, cacheSofaImage } from '@/utils/sofascoreImages';

interface SofaImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  sofaType: 'team' | 'player' | 'tournament';
  sofaId: number | string;
  sofaTheme?: 'dark' | 'light';
}

export function SofaImg({ sofaType, sofaId, sofaTheme, onError, onLoad, ...props }: SofaImgProps) {
  const src =
    sofaType === 'team' ? sofaTeamLogo(sofaId) :
    sofaType === 'player' ? sofaPlayerPhoto(sofaId) :
    sofaTournamentLogo(sofaId, sofaTheme ?? 'dark');

  // Trigger cache khi component mount — kể cả khi ảnh load từ browser cache
  useEffect(() => {
    cacheSofaImage(sofaType, sofaId, sofaTheme);
  }, [sofaType, sofaId, sofaTheme]);

  return (
    <img
      src={src}
      referrerPolicy="no-referrer"
      onLoad={onLoad}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
        onError?.(e);
      }}
      {...props}
    />
  );
}
