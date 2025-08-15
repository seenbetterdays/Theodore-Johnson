import { MAP_WIDTH, MAP_HEIGHT } from '../constants';
import { Tile, Enemy, Item } from '../types';

interface Rect {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

interface Phallus {
    shaft: Rect;
    head: Rect;
}

const createRoom = (map: Tile[][], room: Rect) => {
    for (let y = room.y1; y <= room.y2; y++) {
        for (let x = room.x1; x <= room.x2; x++) {
            if (x >= 0 && x < MAP_WIDTH && y >=0 && y < MAP_HEIGHT) {
                map[y][x] = { type: 'FLOOR', isExplored: false, isVisible: false };
            }
        }
    }
};

const createHTunnel = (map: Tile[][], x1: number, x2: number, y: number) => {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        map[y][x] = { type: 'FLOOR', isExplored: false, isVisible: false };
    }
};

const createVTunnel = (map: Tile[][], y1: number, y2: number, x: number) => {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        map[y][x] = { type: 'FLOOR', isExplored: false, isVisible: false };
    }
};

const intersects = (p1: Phallus, p2: Phallus): boolean => {
    const r1 = { x1: Math.min(p1.shaft.x1, p1.head.x1), y1: Math.min(p1.shaft.y1, p1.head.y1), x2: Math.max(p1.shaft.x2, p1.head.x2), y2: Math.max(p1.shaft.y2, p1.head.y2) };
    const r2 = { x1: Math.min(p2.shaft.x1, p2.head.x1), y1: Math.min(p2.shaft.y1, p2.head.y1), x2: Math.max(p2.shaft.x2, p2.head.x2), y2: Math.max(p2.shaft.y2, p2.head.y2) };
    return r1.x1 <= r2.x2 && r1.x2 >= r2.x1 && r1.y1 <= r2.y2 && r1.y2 >= r2.y1;
}

export const createDungeon = (level: number) => {
    const map: Tile[][] = Array(MAP_HEIGHT).fill(null).map(() => 
        Array(MAP_WIDTH).fill(null).map(() => ({ type: 'WALL', isExplored: false, isVisible: false }))
    );

    const structures: Phallus[] = [];
    const maxStructures = 10;
    const minShaftLen = 8;
    const maxShaftLen = 15;
    const minShaftWidth = 2;
    const maxShaftWidth = 3;
    const minHeadSize = 4;
    const maxHeadSize = 6;

    for (let i = 0; i < maxStructures; i++) {
        const shaftW = Math.floor(Math.random() * (maxShaftWidth - minShaftWidth + 1)) + minShaftWidth;
        const shaftH = Math.floor(Math.random() * (maxShaftLen - minShaftLen + 1)) + minShaftLen;
        const headSize = Math.floor(Math.random() * (maxHeadSize - minHeadSize + 1)) + minHeadSize;
        const orientation = Math.random();

        let newStructure: Phallus;
        if (orientation < 0.5) { // Vertical
            const x = Math.floor(Math.random() * (MAP_WIDTH - Math.max(shaftW, headSize) - 1)) + 1;
            const y = Math.floor(Math.random() * (MAP_HEIGHT - (shaftH + headSize) - 1)) + 1;
            const shaft = { x1: x, y1: y + headSize, x2: x + shaftW, y2: y + headSize + shaftH };
            const head = { x1: x - Math.floor((headSize - shaftW)/2), y1: y, x2: x + shaftW + Math.ceil((headSize - shaftW)/2), y2: y + headSize };
            newStructure = { shaft, head };
        } else { // Horizontal
            const x = Math.floor(Math.random() * (MAP_WIDTH - (shaftH + headSize) - 1)) + 1;
            const y = Math.floor(Math.random() * (MAP_HEIGHT - Math.max(shaftW, headSize) - 1)) + 1;
            const shaft = { x1: x + headSize, y1: y, x2: x + headSize + shaftH, y2: y + shaftW };
            const head = { x1: x, y1: y - Math.floor((headSize - shaftW)/2), x2: x + headSize, y2: y + shaftW + Math.ceil((headSize-shaftW)/2) };
            newStructure = { shaft, head };
        }
        
        let hasIntersection = structures.some(s => intersects(newStructure, s));

        if (!hasIntersection) {
            createRoom(map, newStructure.shaft);
            createRoom(map, newStructure.head);
            
            if (structures.length > 0) {
                const prevStruct = structures[structures.length - 1];
                const newBaseX = newStructure.shaft.x2;
                const newBaseY = Math.floor((newStructure.shaft.y1 + newStructure.shaft.y2) / 2);
                
                const prevCenterX = Math.floor((prevStruct.shaft.x1 + prevStruct.shaft.x2) / 2);
                const prevCenterY = Math.floor((prevStruct.shaft.y1 + prevStruct.shaft.y2) / 2);

                if (Math.random() > 0.5) {
                    createHTunnel(map, prevCenterX, newBaseX, prevCenterY);
                    createVTunnel(map, prevCenterY, newBaseY, newBaseX);
                } else {
                    createVTunnel(map, prevCenterY, newBaseY, prevCenterX);
                    createHTunnel(map, prevCenterX, newBaseX, prevCenterY);
                }
            }
            structures.push(newStructure);
        }
    }

    const playerStart = { 
        x: Math.floor((structures[0].shaft.x1 + structures[0].shaft.x2) / 2),
        y: Math.floor((structures[0].shaft.y1 + structures[0].shaft.y2) / 2)
    };
    
    const lastStruct = structures[structures.length - 1];
    const accessPortPos = {
        x: Math.floor((lastStruct.head.x1 + lastStruct.head.x2) / 2),
        y: Math.floor((lastStruct.head.y1 + lastStruct.head.y2) / 2),
    };
    map[accessPortPos.y][accessPortPos.x] = { type: 'ACCESS_PORT', isExplored: false, isVisible: false };

    const enemies: Enemy[] = [];
    const items: Item[] = [];
    const enemyTypes = [
        { name: 'Security Drone', char: 'd', color: 'text-fuchsia-500', hp: 12, ap: 4 },
        { name: 'Street Samurai', char: 's', color: 'text-red-500', hp: 20, ap: 8 },
        { name: 'Corp Enforcer', char: 'E', color: 'text-purple-400', hp: 30, ap: 12 },
    ];

    for (let i = 1; i < structures.length-1; i++) {
        const room = Math.random() < 0.5 ? structures[i].shaft : structures[i].head;
        if (Math.random() < 0.6) { // Chance to spawn enemies
            const numEnemies = Math.floor(Math.random() * (level + 1)) + 1;
            for(let j = 0; j < numEnemies; j++) {
                const x = Math.floor(Math.random() * (room.x2 - room.x1)) + room.x1;
                const y = Math.floor(Math.random() * (room.y2 - room.y1)) + room.y1;
                if (!enemies.some(e => e.x === x && e.y === y)) {
                    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                    enemies.push({
                        ...type,
                        id: `enemy-${i}-${j}`,
                        x, y,
                        maxHp: type.hp + level * 3,
                        hp: type.hp + level * 3,
                        ap: type.ap + level,
                    });
                }
            }
        }
        if (Math.random() < 0.2) { // Chance to spawn item
            const x = Math.floor(Math.random() * (room.x2 - room.x1)) + room.x1;
            const y = Math.floor(Math.random() * (room.y2 - room.y1)) + room.y1;
            items.push({
                x, y,
                char: '+',
                color: 'text-lime-400',
                name: 'Stimpack',
                type: 'STIMPACK'
            });
        }
    }

    return { map, playerStart, enemies, items };
};