type Player = string;
type Pot = number;
type activityChat = string;

export interface Table {
  players: Player[];
  pot: Pot;
  currentBet: 0;
  activityChat: activityChat[];
}
