import React from 'react';
import { Tile, Player, Enemy, Item } from '../types';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';

interface GameMapProps {
    map: Tile[][];
    player: Player;
    enemies: Enemy[];
    items: Item[];
}

const getTileCharacter = (tile: Tile) => {
    switch (tile.type) {
        case 'WALL': return { char: '█', color: 'text-blue-900' };
        case 'FLOOR': return { char: '·', color: 'text-slate-700' };
        case 'ACCESS_PORT': return { char: '▼', color: 'text-cyan-400' };
        default: return { char: ' ', color: '' };
    }
};

const GameMap: React.FC<GameMapProps> = ({ map, player, enemies, items }) => {
    const entities: { [key: string]: { char: string, color: string } } = {};
    entities[`${player.y},${player.x}`] = { char: player.char, color: player.color };
    enemies.forEach(e => {
        if (map[e.y][e.x]?.isVisible) {
            entities[`${e.y},${e.x}`] = { char: e.char, color: e.color };
        }
    });
    items.forEach(i => {
         if (map[i.y][i.x]?.isVisible) {
            entities[`${i.y},${i.x}`] = { char: i.char, color: i.color };
         }
    });

    return (
        <div 
            className="grid bg-black leading-tight"
            style={{
                gridTemplateColumns: `repeat(${MAP_WIDTH}, minmax(0, 1fr))`,
                fontFamily: 'monospace',
                fontSize: '16px'
            }}
        >
            {map.map((row, y) => (
                row.map((tile, x) => {
                    if (!tile.isExplored) {
                        return <div key={`${x}-${y}`} className="text-transparent">.</div>;
                    }
                    
                    const entity = entities[`${y},${x}`];
                    const tileDisplay = getTileCharacter(tile);
                    
                    let displayChar = tileDisplay.char;
                    let displayColor = tileDisplay.color;
                    let glowClass = '';

                    if (entity && tile.isVisible) {
                        displayChar = entity.char;
                        displayColor = entity.color;
                        if(entity.char === '$' || entity.char === '▼' || entity.char === '+') {
                            glowClass = 'animate-pulse';
                        }
                    }

                    const visibilityClass = tile.isVisible ? 'bg-black/20' : 'bg-black/80';

                    return (
                        <div key={`${x}-${y}`} className={`text-center ${visibilityClass}`}>
                            <span className={`${displayColor} ${glowClass}`}>{displayChar}</span>
                        </div>
                    );
                })
            ))}
        </div>
    );
};

export default GameMap;