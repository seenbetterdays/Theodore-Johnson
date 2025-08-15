import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateRoomDescription(level: number): Promise<string> {
    const prompt = `
        You are a GM for a funny, slightly innuendo-filled cyberpunk roguelike game called "Deep Core".
        The player is a netrunner penetrating the sub-levels of a corporate arcology.
        Generate a short, atmospheric, and humorous description for a sector on Core Depth ${level}.
        Keep it to one or two sentences.
        Examples:
        - The air hums with discarded data streams. A flickering neon sign advertises a long-obsolete piece of wetware.
        - Corroded conduits leak a viscous, faintly glowing fluid onto the grimy floor. Best not to touch.
        - You've jacked into a server farm, the silent monoliths whispering secrets of the corps. A surprisingly sticky patch of coolant is on the floor.
        - This sector smells of ozone and broken dreams. Mostly broken dreams.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return "You enter another dark and grimy sector. It's very... core-like.";
    }
}