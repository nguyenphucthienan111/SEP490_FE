import { registerBones } from 'boneyard-js/react';
import playerCardBones from './player-card.bones.json';
import matchCardBones from './match-card.bones.json';
import leagueCardBones from './league-card.bones.json';
import teamCardBones from './team-card.bones.json';
import forumCardBones from './forum-card.bones.json';

registerBones({
  'player-card': playerCardBones as any,
  'match-card': matchCardBones as any,
  'league-card': leagueCardBones as any,
  'team-card': teamCardBones as any,
  'forum-card': forumCardBones as any,
});
