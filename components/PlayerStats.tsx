import React from 'react';
import { Player } from '../types';

interface PlayerStatsProps {
    player: Player;
    level: number;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player, level }) => {
    const hpPercentage = (player.hp / player.maxHp) * 100;

    return (
        <div className="bg-black/50 p-4 rounded-lg border-2 border-blue-900/50">
            <h2 className="text-3xl text-cyan-400 font-bold mb-4 font-title">OPERATOR STATUS</h2>
            <div className="space-y-3 text-2xl">
                <div>
                    <span className="font-bold text-blue-400">Core Depth:</span>
                    <span className="float-right font-bold text-white">{level}</span>
                </div>
                <div>
                    <span className="font-bold text-blue-400">Integrity:</span>
                    <span className="float-right font-bold text-green-400">{player.hp} / {player.maxHp}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 border border-slate-600">
                    <div
                        className="bg-green-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${hpPercentage}%` }}
                    ></div>
                </div>
                <div>
                    <span className="font-bold text-blue-400">Power:</span>
                    <span className="float-right font-bold text-red-400">{player.ap}</span>
                </div>
            </div>
        </div>
    );
};

export default PlayerStats;