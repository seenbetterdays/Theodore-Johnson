import React from 'react';

interface MessageLogProps {
    messages: string[];
}

const MessageLog: React.FC<MessageLogProps> = ({ messages }) => {
    return (
        <div className="bg-black/50 p-4 rounded-lg border-2 border-blue-900/50 h-64 flex flex-col">
            <h2 className="text-3xl text-cyan-400 font-bold mb-2 flex-shrink-0 font-title">LOG</h2>
            <div className="flex-grow overflow-y-auto pr-2">
                <ul className="flex flex-col-reverse">
                    {messages.map((msg, index) => (
                        <li 
                            key={index} 
                            className={`py-1 text-xl ${index === 0 ? 'text-white' : 'text-cyan-500'}`}
                        >
                            &gt; {msg}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MessageLog;