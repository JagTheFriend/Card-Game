type Player = string;
type PlayerCards = {
  id: string;
  hand: string[];
};

export interface Table {
  players: Player[];
  pot: number;
  amountRaised: number;
  cards: string[];
  cardsShown: number;
  playerCards: PlayerCards[];
}
