import { onSofaImgError } from '@/utils/sofascoreImages';

interface SofaImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  sofaType: 'team' | 'player' | 'tournament';
  sofaId: number | string;
  sofaTheme?: 'dark' | 'light';
}

/**
 * Drop-in replacement cho <img src={sofaTeamLogo(...)} />.
 * Tự động fallback + cache lên Cloudinary khi ảnh bị 403.
 */
export function SofaImg({ sofaType, sofaId, sofaTheme, onError, ...props }: SofaImgProps) {
  return (
    <img
      {...props}
      onError={(e) => {
        onSofaImgError(sofaType, sofaId, sofaTheme)(e);
        onError?.(e);
      }}
    />
  );
}
