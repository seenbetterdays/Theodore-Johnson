import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Player, Enemy, Tile, GameStatus, Item } from './types';
import { MAP_WIDTH, MAP_HEIGHT } from './constants';
import { createDungeon } from './services/dungeonService';
import { generateRoomDescription } from './services/geminiService';
import GameMap from './components/GameMap';
import PlayerStats from './components/PlayerStats';
import MessageLog from './components/MessageLog';
import GameOverScreen from './components/GameOverScreen';
import StartScreen from './components/StartScreen';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.START_SCREEN);
    const [loading, setLoading] = useState(false);

    const updateFov = useCallback((map: Tile[][], player: Player) => {
        const newMap = map.map(row => row.map(tile => ({ ...tile, isVisible: false })));
        const radius = 8;
        for (let y = player.y - radius; y <= player.y + radius; y++) {
            for (let x = player.x - radius; x <= player.x + radius; x++) {
                if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                    const distance = Math.sqrt((player.x - x) ** 2 + (player.y - y) ** 2);
                    if (distance <= radius) {
                        // For simplicity, we're not doing complex line of sight, just radius.
                        newMap[y][x].isVisible = true;
                        newMap[y][x].isExplored = true;
                    }
                }
            }
        }
        return newMap;
    }, []);

    const initGame = useCallback(async (level: number) => {
        setLoading(true);
        const { map, playerStart, enemies, items } = createDungeon(level);
        const player: Player = {
            ...playerStart,
            hp: gameState?.player.hp ?? 50,
            maxHp: gameState?.player.maxHp ?? 50,
            ap: gameState?.player.ap ?? 10,
            char: '$',
            color: 'text-cyan-300',
            name: 'Operator',
        };
        const initialMap = updateFov(map, player);
        const initialMessages = [`Connection established. Welcome to Core Depth ${level}.`];

        try {
            const description = await generateRoomDescription(level);
            initialMessages.push(description);
        } catch (error) {
            console.error("Failed to generate room description:", error);
            initialMessages.push("You enter a dark sector. The hum of latent data fills the air...");
        }

        setGameState({
            map: initialMap,
            player,
            enemies,
            items,
            level,
            messages: initialMessages,
        });
        setGameStatus(GameStatus.PLAYING);
        setLoading(false);
    }, [updateFov, gameState]);
    
    const startGame = () => {
        setGameState(null); // Reset previous game state
        initGame(1);
    };

    const addMessage = (message: string) => {
        setGameState(prev => {
            if (!prev) return null;
            const newMessages = [message, ...prev.messages];
            if (newMessages.length > 10) newMessages.pop();
            return { ...prev, messages: newMessages };
        });
    };

    const moveEntity = (entity: Player | Enemy, dx: number, dy: number, state: GameState): GameState => {
        const newX = entity.x + dx;
        const newY = entity.y + dy;

        if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT || state.map[newY][newX].type === 'WALL') {
            return state;
        }

        if (entity.name === 'Operator') {
            const enemy = state.enemies.find(e => e.x === newX && e.y === newY);
            if (enemy) {
                // Combat
                const enemyDamage = Math.max(1, enemy.ap);
                const playerDamage = Math.max(1, (entity as Player).ap);

                const newEnemyHp = enemy.hp - playerDamage;
                addMessage(`You hit the ${enemy.name} for ${playerDamage} damage.`);

                let newEnemies = state.enemies;
                if (newEnemyHp <= 0) {
                    addMessage(`The ${enemy.name} is decommissioned!`);
                    newEnemies = state.enemies.filter(e => e.id !== enemy.id);
                } else {
                    const newPlayerHp = state.player.hp - enemyDamage;
                    addMessage(`The ${enemy.name} retaliates for ${enemyDamage} damage.`);
                    if (newPlayerHp <= 0) {
                        setGameStatus(GameStatus.GAME_OVER);
                    }
                    newEnemies = state.enemies.map(e => e.id === enemy.id ? { ...e, hp: newEnemyHp } : e);
                    return { ...state, enemies: newEnemies, player: { ...state.player, hp: newPlayerHp } };
                }

                return { ...state, enemies: newEnemies };
            }
        } else { // Enemy movement
             const playerAtTarget = state.player.x === newX && state.player.y === newY;
             if (playerAtTarget) {
                 const enemyDamage = Math.max(1, entity.ap);
                 const newPlayerHp = state.player.hp - enemyDamage;
                 addMessage(`The ${entity.name} attacks you for ${enemyDamage} damage.`);
                 if (newPlayerHp <= 0) {
                     setGameStatus(GameStatus.GAME_OVER);
                 }
                 return {...state, player: {...state.player, hp: newPlayerHp}};
             }
        }
        
        const newEntity = { ...entity, x: newX, y: newY };
        if (entity.name === 'Operator') {
             const newPlayer = newEntity as Player;
             const newMap = updateFov(state.map, newPlayer);
             return { ...state, player: newPlayer, map: newMap };
        } else {
            const newEnemies = state.enemies.map(e => e.id === (entity as Enemy).id ? newEntity as Enemy : e);
            return { ...state, enemies: newEnemies };
        }
    };
    
    const handlePlayerAction = (dx: number, dy: number) => {
      if (!gameState || gameStatus !== GameStatus.PLAYING) return;

      let newState = { ...gameState };
      const newPlayerX = newState.player.x + dx;
      const newPlayerY = newState.player.y + dy;

      // Check for access port
      if (newState.map[newPlayerY][newPlayerX].type === 'ACCESS_PORT') {
          addMessage("You jack into the next sub-level...");
          initGame(newState.level + 1);
          return;
      }

      // Check for items
      const itemIndex = newState.items.findIndex(i => i.x === newPlayerX && i.y === newPlayerY);
      if (itemIndex > -1) {
          const item = newState.items[itemIndex];
          addMessage(`You found a ${item.name}!`);
          if (item.type === 'STIMPACK') {
              const healAmount = Math.floor(newState.player.maxHp * 0.5);
              const newHp = Math.min(newState.player.maxHp, newState.player.hp + healAmount);
              newState.player.hp = newHp;
              addMessage(`System integrity restored by ${healAmount} points.`);
          }
          newState.items.splice(itemIndex, 1);
      }
      
      newState = moveEntity(newState.player, dx, dy, newState);

      // Enemy turn
      let enemiesTurnState = newState;
      newState.enemies.forEach(enemy => {
        const distanceToPlayer = Math.sqrt((enemy.x - enemiesTurnState.player.x)**2 + (enemy.y - enemiesTurnState.player.y)**2);
        if (distanceToPlayer < 8) { // Simple chase logic
          const edx = Math.sign(enemiesTurnState.player.x - enemy.x);
          const edy = Math.sign(enemiesTurnState.player.y - enemy.y);
          if (enemiesTurnState.enemies.find(e => e.x === enemy.x + edx && e.y === enemy.y + edy)) {
            // Don't move into another enemy
          } else {
            enemiesTurnState = moveEntity(enemy, edx, edy, enemiesTurnState);
          }
        }
      });
      
      setGameState(enemiesTurnState);
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (gameStatus !== GameStatus.PLAYING) return;
        let dx = 0, dy = 0;
        switch (event.key) {
            case 'ArrowUp': dy = -1; break;
            case 'ArrowDown': dy = 1; break;
            case 'ArrowLeft': dx = -1; break;
            case 'ArrowRight': dx = 1; break;
            default: return;
        }
        if (dx !== 0 || dy !== 0) {
            handlePlayerAction(dx, dy);
        }
    }, [gameStatus, handlePlayerAction]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0d0f1a]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400 mx-auto"></div>
                    <p className="text-2xl mt-4 text-cyan-300">Penetrating Deeper...</p>
                </div>
            </div>
        );
    }
    
    if (gameStatus === GameStatus.START_SCREEN) {
        return <StartScreen onStart={startGame} />;
    }

    if (gameStatus === GameStatus.GAME_OVER && gameState) {
        return <GameOverScreen level={gameState.level} onRestart={startGame} />;
    }

    if (!gameState) {
        return null;
    }

    return (
        <div className="bg-[#0d0f1a] min-h-screen flex flex-col items-center justify-center p-4 text-cyan-300 text-2xl">
            <header className="w-full max-w-7xl mb-4 text-center">
                <h1 className="text-5xl font-title text-cyan-400 drop-shadow-[0_2px_2px_rgba(0,240,255,0.5)]">DEEP CORE</h1>
            </header>
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-6">
                <main className="md:col-span-3 bg-black/50 p-2 rounded-lg border-2 border-blue-900/50">
                    <GameMap map={gameState.map} player={gameState.player} enemies={gameState.enemies} items={gameState.items} />
                </main>
                <aside className="md:col-span-1 flex flex-col gap-6">
                    <PlayerStats player={gameState.player} level={gameState.level} />
                    <MessageLog messages={gameState.messages} />
                </aside>
            </div>
            <footer className="mt-4 text-blue-700 text-sm">
                <p>Use Arrow Keys to move. How deep can you penetrate?</p>
            </footer>
        </div>
    );
};

export default App;