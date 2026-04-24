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

  return (
    <img
      src={src}
      onLoad={(e) => {
        // Cache lên Cloudinary ngầm sau khi ảnh load thành công
        cacheSofaImage(sofaType, sofaId, sofaTheme);
        onLoad?.(e);
      }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
        onError?.(e);
      }}
      {...props}
    />
  );
}
