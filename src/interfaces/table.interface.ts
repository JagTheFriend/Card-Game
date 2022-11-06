type Player = string;

export interface Table {
  players: Player[];
  pot: number;
  amountRaised: number;
  cards: string[];
}
