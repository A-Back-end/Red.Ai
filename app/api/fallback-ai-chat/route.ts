import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function POST(req: NextRequest) {
    if (!openai) {
        return NextResponse.json({ 
            error: 'The standard OpenAI API key is not configured. This fallback is unavailable.' 
        }, { status: 503 });
    }

    try {
        const body = await req.json();
        const { messages } = body;

        if (!messages) {
            return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
        }

        // Basic system prompt for the fallback
        const systemMessage = {
            role: 'system',
            content: 'You are a helpful AI assistant. Provide a concise and accurate response.'
        };

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Use a cheaper/faster model for fallback
            messages: [systemMessage, ...messages.slice(-5)], // Limit history
            max_tokens: 800,
            temperature: 0.7,
        });

        return NextResponse.json(response.choices[0]);

    } catch (error: any) {
        console.error('Fallback AI chat error:', error);
        return NextResponse.json({ error: 'Error processing your request in the fallback service.' }, { status: 500 });
    }
} 