// config.js - Configuration management
class Config {
    constructor() {
        this.provider = localStorage.getItem('aiProvider') || 'gemini';
        this.apiKey = localStorage.getItem('apiKey') || '';
        this.isConfigured = !!this.apiKey;
    }

    saveConfig(provider, apiKey) {
        this.provider = provider;
        this.apiKey = apiKey;
        this.isConfigured = true;
        localStorage.setItem('aiProvider', provider);
        localStorage.setItem('apiKey', apiKey);
    }

    clearConfig() {
        this.apiKey = '';
        this.isConfigured = false;
        localStorage.removeItem('apiKey');
        localStorage.removeItem('aiProvider');
    }

    getApiKey() {
        return this.apiKey;
    }

    getProvider() {
        return this.provider;
    }
}

const config = new Config();
