import React from 'react';

interface StartScreenProps {
    onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0d0f1a] text-center p-4">
            <h1 className="text-7xl md:text-8xl font-title text-cyan-400 drop-shadow-[0_4px_4px_rgba(0,240,255,0.4)]">
                DEEP CORE
            </h1>
            <p className="text-2xl text-cyan-300 mt-4 mb-12 max-w-2xl">
                A humorous, cyberpunk roguelike. Jack into the Deep Core of a corporate arcology, bypass security, and probe its secrets. Just how deep can you penetrate?
            </p>
            <button
                onClick={onStart}
                className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-4 px-8 rounded-lg text-3xl font-title transition-transform transform hover:scale-105 shadow-lg shadow-cyan-500/50"
            >
                Jack In
            </button>
        </div>
    );
};

export default StartScreen;