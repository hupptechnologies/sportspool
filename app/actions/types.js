/* @flow */

export type Team = {
  id: string,
  name: string,
  seed: number,
  abbreviation: string
};

export type Pick = {
  id: string,
  team: Team,
  game: Game
};

export type Game = {
  id: string,
  status: 'pregame' | 'inprogress' | 'final'
};
