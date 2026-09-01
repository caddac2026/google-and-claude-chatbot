// api.js - API integration for Gemini and Claude

class AIApi {
    constructor(provider, apiKey) {
        this.provider = provider;
        this.apiKey = apiKey;
    }

    async sendMessage(message, images = []) {
        if (this.provider === 'gemini') {
            return this.sendToGemini(message, images);
        } else if (this.provider === 'claude') {
            return this.sendToClaude(message, images);
        }
    }

    async sendToGemini(message, images = []) {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + this.apiKey;

        let content = [];

        // Add images first
        for (const imageData of images) {
            content.push({
                inlineData: {
                    mimeType: imageData.mimeType,
                    data: imageData.data
                }
            });
        }

        // Add text message
        content.push({
            text: message
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: content
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Gemini API error');
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            throw new Error('Gemini Error: ' + error.message);
        }
    }

    async sendToClaude(message, images = []) {
        const url = 'https://api.anthropic.com/v1/messages';

        let content = [];

        // Add images first
        for (const imageData of images) {
            content.push({
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: imageData.mimeType,
                    data: imageData.data.split(',')[1] // Remove the data:image/png;base64, prefix
                }
            });
        }

        // Add text message
        content.push({
            type: 'text',
            text: message
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
                    messages: [{
                        role: 'user',
                        content: content
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Claude API error');
            }

            const data = await response.json();
            return data.content[0].text;
        } catch (error) {
            throw new Error('Claude Error: ' + error.message);
        }
    }
}

let api = null;

function initializeAPI(provider, apiKey) {
    api = new AIApi(provider, apiKey);
    return api;
}
