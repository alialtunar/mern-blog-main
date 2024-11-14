// services/claude-service.js
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

class ClaudeService {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
    }

    async sendMessage(content) {
        try {
            const response = await this.anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 8192,
                messages: [{ role: "user", content: content }]
            });
            return response;
        } catch (error) {
            throw new Error(`Claude API Error: ${error.message}`);
        }
    }
}

export default new ClaudeService();