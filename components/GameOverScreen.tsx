import React from 'react';

interface GameOverScreenProps {
    level: number;
    onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ level, onRestart }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0d0f1a] text-center p-4">
            <h1 className="text-8xl font-title text-red-500 drop-shadow-[0_4px_4px_rgba(255,0,0,0.5)]">
                FLATLINED
            </h1>
            <p className="text-3xl text-cyan-300 mt-4 mb-12">
                Your chrome has been zeroed. You only reached Core Depth <span className="text-yellow-300 font-bold">{level}</span>.
            </p>
            <button
                onClick={onRestart}
                className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-4 px-8 rounded-lg text-3xl font-title transition-transform transform hover:scale-105 shadow-lg shadow-cyan-500/50"
            >
                Re-Clone
            </button>
        </div>
    );
};

export default GameOverScreen;