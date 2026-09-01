// app.js - Main application logic

const setupPanel = document.getElementById('setupPanel');
const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const apiProviderSelect = document.getElementById('apiProvider');
const apiKeyInput = document.getElementById('apiKey');
const saveConfigBtn = document.getElementById('saveConfig');
const clearChatBtn = document.getElementById('clearChat');
const logoutBtn = document.getElementById('logout');

let selectedImages = [];

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    if (config.isConfigured) {
        showChat();
        apiProviderSelect.value = config.getProvider();
    } else {
        showSetup();
    }
});

// Setup Panel Events
saveConfigBtn.addEventListener('click', () => {
    const provider = apiProviderSelect.value;
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        alert('Please enter your API key');
        return;
    }

    config.saveConfig(provider, apiKey);
    initializeAPI(provider, apiKey);
    chatMessages.innerHTML = '';
    selectedImages = [];
    previewContainer.innerHTML = '';
    showChat();
    addMessage('assistant', 'Hello! I\'m your AI assistant. You can upload images and ask me questions about them or any other topic. How can I help you today?');
});

// Chat Events
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

imageInput.addEventListener('change', handleImageSelect);
clearChatBtn.addEventListener('click', () => {
    chatMessages.innerHTML = '';
    selectedImages = [];
    previewContainer.innerHTML = '';
    userInput.value = '';
});

logoutBtn.addEventListener('click', () => {
    config.clearConfig();
    setupPanel.style.display = 'block';
    chatContainer.style.display = 'none';
    chatMessages.innerHTML = '';
    selectedImages = [];
    previewContainer.innerHTML = '';
    userInput.value = '';
    apiKeyInput.value = '';
});

// Handle image selection
function handleImageSelect(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedImages.push({
                data: event.target.result,
                mimeType: file.type,
                name: file.name
            });
            updatePreview();
        };
        reader.readAsDataURL(file);
    });
}

// Update preview
function updatePreview() {
    previewContainer.innerHTML = '';
    selectedImages.forEach((img, index) => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            <img src="${img.data}" alt="Preview">
            <button class="preview-remove" onclick="removeImage(${index})">×</button>
        `;
        previewContainer.appendChild(div);
    });
}

// Remove image
function removeImage(index) {
    selectedImages.splice(index, 1);
    updatePreview();
}

// Send message
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message && selectedImages.length === 0) {
        alert('Please enter a message or select images');
        return;
    }

    // Add user message
    addMessage('user', message, selectedImages);
    userInput.value = '';
    sendBtn.disabled = true;

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant';
    loadingDiv.innerHTML = `<div class="message-content"><div class="loading"><span class="loading-spinner"></span>Thinking...</div></div>`;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        // Prepare images for API
        const imagesToSend = selectedImages.map(img => ({
            data: img.data.split(',')[1], // Remove base64 prefix for Gemini
            mimeType: img.mimeType
        }));

        const response = await api.sendMessage(message, imagesToSend);
        
        // Remove loading indicator
        loadingDiv.remove();
        
        // Add assistant response
        addMessage('assistant', response);
        
        // Clear images after sending
        selectedImages = [];
        previewContainer.innerHTML = '';
        imageInput.value = '';
    } catch (error) {
        loadingDiv.remove();
        addMessage('assistant', '❌ Error: ' + error.message);
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// Add message to chat
function addMessage(role, content, images = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    let html = `<div class="message-content">${escapeHtml(content)}`;
    
    if (images && images.length > 0) {
        html += '<div class="message-images">';
        images.forEach(img => {
            html += `<img src="${img.data}" alt="Image" class="message-image">`;
        });
        html += '</div>';
    }
    
    html += '</div>';
    messageDiv.innerHTML = html;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show/hide panels
function showSetup() {
    setupPanel.style.display = 'block';
    chatContainer.style.display = 'none';
}

function showChat() {
    setupPanel.style.display = 'none';
    chatContainer.style.display = 'flex';
}
