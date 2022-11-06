type Player = string;
type Pot = number;

export interface Table {
  players: Player[];
  pot: Pot;
  amountRaised: 0;
}
