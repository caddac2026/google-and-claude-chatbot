// config.js - Configuration management

class ConfigManager {
    constructor() {
        this.provider = localStorage.getItem('aiProvider') || 'gemini';
        this.apiKey = localStorage.getItem('apiKey') || '';
    }

    saveConfig(provider, apiKey) {
        this.provider = provider;
        this.apiKey = apiKey;
        localStorage.setItem('aiProvider', provider);
        localStorage.setItem('apiKey', apiKey);
    }

    getProvider() {
        return this.provider;
    }

    getApiKey() {
        return this.apiKey;
    }

    get isConfigured() {
        return this.apiKey && this.apiKey.length > 0;
    }

    clearConfig() {
        this.apiKey = '';
        this.provider = 'gemini';
        localStorage.removeItem('apiKey');
        localStorage.removeItem('aiProvider');
    }
}

const config = new ConfigManager();
