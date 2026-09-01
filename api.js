// api.js - API communication with Google Gemini and Claude

class APIManager {
    constructor() {
        this.provider = config.getProvider();
        this.apiKey = config.getApiKey();
    }

    async sendMessage(message, images = []) {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }

        this.provider = config.getProvider();
        this.apiKey = config.getApiKey();

        if (this.provider === 'gemini') {
            return await this.sendToGemini(message, images);
        } else if (this.provider === 'claude') {
            return await this.sendToClaude(message, images);
        } else {
            throw new Error('Unknown API provider');
        }
    }

    async sendToGemini(message, images = []) {
        try {
            const body = {
                contents: [{
                    parts: [
                        { text: message },
                        ...images.map(img => ({
                            inlineData: {
                                mimeType: img.mimeType,
                                data: img.data
                            }
                        }))
                    ]
                }]
            };

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Gemini API error');
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response from Gemini API');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
    }

    async sendToClaude(message, images = []) {
        try {
            const content = [
                ...images.map(img => ({
                    type: 'image',
                    source: {
                        type: 'base64',
                        media_type: img.mimeType,
                        data: img.data
                    }
                })),
                {
                    type: 'text',
                    text: message
                }
            ];

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
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
            
            if (!data.content || !data.content[0]) {
                throw new Error('Invalid response from Claude API');
            }

            return data.content[0].text;
        } catch (error) {
            throw new Error(`Claude API Error: ${error.message}`);
        }
    }

    updateConfig(provider, apiKey) {
        this.provider = provider;
        this.apiKey = apiKey;
    }
}

const api = new APIManager();

// Initialize API with config
function initializeAPI(provider, apiKey) {
    api.updateConfig(provider, apiKey);
}
