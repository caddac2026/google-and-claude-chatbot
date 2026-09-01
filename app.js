// app.js - Main application logic with login and conversation management

let currentConversationId = null;
let selectedImages = [];
let apiConfigured = false;

// DOM Elements
const authContainer = document.getElementById('authContainer');
const appWrapper = document.getElementById('appWrapper');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const imageInput = document.getElementById('imageInput');
const imageUploadBtn = document.getElementById('imageUploadBtn');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userAvatar = document.getElementById('userAvatar');
const conversationsList = document.getElementById('conversationsList');
const newChatBtn = document.getElementById('newChatBtn');
const settingsBtn = document.getElementById('settingsBtn');
const logoutBtn = document.getElementById('logoutBtn');
const deleteBtn = document.getElementById('deleteBtn');
const shareBtn = document.getElementById('shareBtn');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const chatTitle = document.getElementById('chatTitle');
const setupPanel = document.getElementById('setupPanel');
const saveConfigBtn = document.getElementById('saveConfig');
const apiProviderSelect = document.getElementById('apiProvider');
const apiKeyInput = document.getElementById('apiKey');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const changeApiBtn = document.getElementById('changeApiBtn');
const providerSelect = document.getElementById('providerSelect');
const apiKeyDisplay = document.getElementById('apiKeyDisplay');
const loadingOverlay = document.getElementById('loadingOverlay');
const themeSelect = document.getElementById('themeSelect');

// Initialize app
window.addEventListener('DOMContentLoaded', async () => {
    await db.init();
    
    if (auth.isLoggedIn()) {
        showApp();
        initializeApp();
    } else {
        showAuth();
    }
});

// ===== Authentication Events =====

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        showLoading(true);
        await auth.login(email, password);
        showApp();
        initializeApp();
    } catch (error) {
        showMessage('error', error.message);
    } finally {
        showLoading(false);
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirm').value;

    try {
        showLoading(true);
        await auth.signup(name, email, password, confirmPassword);
        showApp();
        initializeApp();
    } catch (error) {
        showMessage('error', error.message);
    } finally {
        showLoading(false);
    }
});

// ===== Chat Events =====

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

imageUploadBtn.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', handleImageSelect);

newChatBtn.addEventListener('click', createNewConversation);
settingsBtn.addEventListener('click', openSettings);
logoutBtn.addEventListener('click', handleLogout);
deleteBtn.addEventListener('click', deleteCurrentConversation);
shareBtn.addEventListener('click', shareConversation);
menuBtn.addEventListener('click', toggleSidebar);
closeSettings.addEventListener('click', closeSettingsModal);
deleteAccountBtn.addEventListener('click', handleDeleteAccount);
changeApiBtn.addEventListener('click', () => {
    setupPanel.style.display = setupPanel.style.display === 'none' ? 'block' : 'none';
});

saveConfigBtn.addEventListener('click', saveApiConfig);

// Quick action buttons
document.querySelectorAll('.quick-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
        messageInput.value = e.target.dataset.prompt;
        messageInput.focus();
    });
});

// ===== Functions =====

async function initializeApp() {
    const user = auth.getCurrentUser();
    userName.textContent = user.name;
    userEmail.textContent = user.email;
    userAvatar.textContent = user.name.charAt(0).toUpperCase();
    
    providerSelect.value = config.getProvider();
    apiKeyDisplay.value = '•'.repeat(20);
    
    await loadConversations();
    checkApiConfig();
}

function showApp() {
    authContainer.style.display = 'none';
    appWrapper.style.display = 'flex';
}

function showAuth() {
    authContainer.style.display = 'flex';
    appWrapper.style.display = 'none';
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupConfirm').value = '';
}

function showMessage(type, text) {
    authMessage.className = `auth-message ${type}`;
    authMessage.textContent = text;
}

function clearMessage() {
    authMessage.className = 'auth-message';
}

function showLoading(show) {
    loadingOverlay.classList.toggle('active', show);
}

async function createNewConversation() {
    const user = auth.getCurrentUser();
    const conversation = await db.createConversation(user.email, 'New Conversation');
    currentConversationId = conversation.id;
    selectedImages = [];
    imagePreviewContainer.innerHTML = '';
    messageInput.value = '';
    messagesContainer.innerHTML = `
        <div class="welcome-section">
            <div class="welcome-icon">🤖</div>
            <h2>New Conversation</h2>
            <p>Start chatting with your AI assistant. You can upload images and ask any questions.</p>
            <div class="quick-actions">
                <button class="quick-action" data-prompt="Write a creative story">📖 Story</button>
                <button class="quick-action" data-prompt="Analyze this image">🔍 Analyze</button>
                <button class="quick-action" data-prompt="Help me code">💻 Code</button>
                <button class="quick-action" data-prompt="Answer my question">❓ Question</button>
            </div>
        </div>
    `;
    
    document.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            messageInput.value = e.target.dataset.prompt;
            messageInput.focus();
        });
    });

    chatTitle.textContent = 'New Conversation';
    await loadConversations();
}

async function loadConversations() {
    const user = auth.getCurrentUser();
    const conversations = await db.getConversations(user.email);
    
    conversationsList.innerHTML = '';
    conversations.forEach(conv => {
        const div = document.createElement('div');
        div.className = `conversation-item ${conv.id === currentConversationId ? 'active' : ''}`;
        div.innerHTML = `<p>${conv.title}</p>`;
        div.addEventListener('click', () => loadConversation(conv.id));
        conversationsList.appendChild(div);
    });
}

async function loadConversation(conversationId) {
    currentConversationId = conversationId;
    selectedImages = [];
    imagePreviewContainer.innerHTML = '';
    messageInput.value = '';
    
    const messages = await db.getMessages(conversationId);
    messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="welcome-section">
                <div class="welcome-icon">💬</div>
                <h2>Start Conversation</h2>
                <p>Begin chatting to see your messages here.</p>
            </div>
        `;
    } else {
        messages.forEach(msg => {
            displayMessage(msg.role, msg.content, msg.images || []);
        });
    }
    
    await loadConversations();
}

async function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message && selectedImages.length === 0) {
        alert('Please enter a message or select images');
        return;
    }

    if (!apiConfigured) {
        alert('Please configure your API key first');
        setupPanel.style.display = 'block';
        return;
    }

    if (!currentConversationId) {
        await createNewConversation();
    }

    // Save user message
    await db.addMessage(currentConversationId, 'user', message, selectedImages);
    displayMessage('user', message, selectedImages);

    messageInput.value = '';
    selectedImages = [];
    imagePreviewContainer.innerHTML = '';
    sendBtn.disabled = true;

    // Show loading
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant';
    loadingDiv.innerHTML = `<div class="message-content"><div class="loading"><span class="loader"></span>Thinking...</div></div>`;
    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const imagesToSend = selectedImages.map(img => ({
            data: img.data.split(',')[1],
            mimeType: img.mimeType
        }));

        const response = await api.sendMessage(message, imagesToSend);
        loadingDiv.remove();
        
        await db.addMessage(currentConversationId, 'assistant', response);
        displayMessage('assistant', response);

        // Update conversation title if first message
        const messages = await db.getMessages(currentConversationId);
        if (messages.length <= 2) {
            const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
            await db.updateConversationTitle(currentConversationId, title);
            chatTitle.textContent = title;
            await loadConversations();
        }
    } catch (error) {
        loadingDiv.remove();
        displayMessage('assistant', '❌ Error: ' + error.message);
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

function displayMessage(role, content, images = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    let html = `<div class="message-content">${escapeHtml(content)}`;
    
    if (images && images.length > 0) {
        html += '<div class="message-images">';
        images.forEach(img => {
            const src = img.data || img;
            html += `<img src="${src}" alt="Image" class="message-image">`;
        });
        html += '</div>';
    }
    
    html += '</div>';
    messageDiv.innerHTML = html;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleImageSelect(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (file.size > 20 * 1024 * 1024) {
            alert('File size exceeds 20MB limit');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            selectedImages.push({
                data: event.target.result,
                mimeType: file.type,
                name: file.name
            });
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    });
}

function updateImagePreview() {
    imagePreviewContainer.innerHTML = '';
    selectedImages.forEach((img, index) => {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            <img src="${img.data}" alt="Preview">
            <button class="preview-remove" onclick="removeImage(${index})">×</button>
        `;
        imagePreviewContainer.appendChild(div);
    });
}

function removeImage(index) {
    selectedImages.splice(index, 1);
    updateImagePreview();
}

function saveApiConfig() {
    const provider = apiProviderSelect.value;
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        alert('Please enter your API key');
        return;
    }

    config.saveConfig(provider, apiKey);
    initializeAPI(provider, apiKey);
    checkApiConfig();
    setupPanel.style.display = 'none';
    alert('API Configuration saved successfully!');
}

function checkApiConfig() {
    apiConfigured = config.isConfigured;
    if (apiConfigured) {
        setupPanel.style.display = 'none';
    } else {
        setupPanel.style.display = 'block';
    }
}

async function deleteCurrentConversation() {
    if (!currentConversationId) return;
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
        return;
    }

    await db.deleteConversation(currentConversationId);
    currentConversationId = null;
    messagesContainer.innerHTML = '';
    await loadConversations();
    await createNewConversation();
}

function shareConversation() {
    alert('Share feature coming soon!');
}

function toggleSidebar() {
    sidebar.classList.toggle('active');
}

function openSettings() {
    settingsModal.classList.add('active');
}

function closeSettingsModal() {
    settingsModal.classList.remove('active');
}

async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
        showAuth();
    }
}

async function handleDeleteAccount() {
    const user = auth.getCurrentUser();
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
        const password = prompt('Enter your password to confirm:');
        if (password) {
            try {
                const isValid = await db.verifyUser(user.email, password);
                if (isValid) {
                    await auth.deleteAccount(user.email);
                    showAuth();
                    alert('Account deleted successfully');
                } else {
                    alert('Invalid password');
                }
            } catch (error) {
                alert('Error deleting account: ' + error.message);
            }
        }
    }
}
