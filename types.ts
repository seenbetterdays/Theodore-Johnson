export enum GameStatus {
    START_SCREEN,
    PLAYING,
    GAME_OVER
}

export type TileType = 'WALL' | 'FLOOR' | 'ACCESS_PORT';

export interface Tile {
    type: TileType;
    isExplored: boolean;
    isVisible: boolean;
}

export interface Entity {
    x: number;
    y: number;
    char: string;
    color: string;
    name: string;
}

export interface Player extends Entity {
    hp: number;
    maxHp: number;
    ap: number;
}

export interface Enemy extends Entity {
    id: string;
    hp: number;
    maxHp: number;
    ap: number;
}

export type ItemType = 'STIMPACK';

export interface Item extends Entity {
    type: ItemType;
}

export interface GameState {
    map: Tile[][];
    player: Player;
    enemies: Enemy[];
    items: Item[];
    level: number;
    messages: string[];
}