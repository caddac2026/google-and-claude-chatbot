// db.js - Local database management using IndexedDB

class Database {
    constructor() {
        this.dbName = 'AIChatbotDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Users store
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'email' });
                }

                // Conversations store
                if (!db.objectStoreNames.contains('conversations')) {
                    const conversationStore = db.createObjectStore('conversations', { keyPath: 'id', autoIncrement: true });
                    conversationStore.createIndex('userEmail', 'userEmail', { unique: false });
                    conversationStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Messages store
                if (!db.objectStoreNames.contains('messages')) {
                    const messageStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
                    messageStore.createIndex('conversationId', 'conversationId', { unique: false });
                    messageStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    async addUser(email, password, name) {
        const user = {
            email,
            password: this._hashPassword(password),
            name,
            createdAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['users'], 'readwrite');
            const store = tx.objectStore('users');
            const request = store.add(user);

            request.onerror = () => reject('User already exists');
            request.onsuccess = () => resolve(user);
        });
    }

    async getUser(email) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['users'], 'readonly');
            const store = tx.objectStore('users');
            const request = store.get(email);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async verifyUser(email, password) {
        const user = await this.getUser(email);
        if (!user) return false;
        return user.password === this._hashPassword(password);
    }

    async createConversation(userEmail, title = 'New Conversation') {
        const conversation = {
            userEmail,
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['conversations'], 'readwrite');
            const store = tx.objectStore('conversations');
            const request = store.add(conversation);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                conversation.id = request.result;
                resolve(conversation);
            };
        });
    }

    async getConversations(userEmail) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['conversations'], 'readonly');
            const store = tx.objectStore('conversations');
            const index = store.index('userEmail');
            const request = index.getAll(userEmail);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                // Sort by most recent first
                const conversations = request.result.sort((a, b) => 
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );
                resolve(conversations);
            };
        });
    }

    async deleteConversation(conversationId) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['conversations', 'messages'], 'readwrite');
            
            // Delete conversation
            const conversationStore = tx.objectStore('conversations');
            conversationStore.delete(conversationId);

            // Delete all messages in conversation
            const messageStore = tx.objectStore('messages');
            const index = messageStore.index('conversationId');
            const request = index.openCursor(IDBKeyRange.only(conversationId));

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };

            tx.onerror = () => reject(tx.error);
            tx.oncomplete = () => resolve(true);
        });
    }

    async addMessage(conversationId, role, content, images = []) {
        const message = {
            conversationId,
            role,
            content,
            images,
            timestamp: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['messages', 'conversations'], 'readwrite');
            
            // Add message
            const messageStore = tx.objectStore('messages');
            const messageRequest = messageStore.add(message);

            // Update conversation timestamp
            const conversationStore = tx.objectStore('conversations');
            const getRequest = conversationStore.get(conversationId);

            getRequest.onsuccess = () => {
                const conversation = getRequest.result;
                conversation.updatedAt = new Date().toISOString();
                conversationStore.put(conversation);
            };

            tx.onerror = () => reject(tx.error);
            tx.oncomplete = () => {
                message.id = messageRequest.result;
                resolve(message);
            };
        });
    }

    async getMessages(conversationId) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['messages'], 'readonly');
            const store = tx.objectStore('messages');
            const index = store.index('conversationId');
            const request = index.getAll(conversationId);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const messages = request.result.sort((a, b) => 
                    new Date(a.timestamp) - new Date(b.timestamp)
                );
                resolve(messages);
            };
        });
    }

    async updateConversationTitle(conversationId, title) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['conversations'], 'readwrite');
            const store = tx.objectStore('conversations');
            const getRequest = store.get(conversationId);

            getRequest.onsuccess = () => {
                const conversation = getRequest.result;
                conversation.title = title;
                conversation.updatedAt = new Date().toISOString();
                const updateRequest = store.put(conversation);

                updateRequest.onsuccess = () => resolve(conversation);
                updateRequest.onerror = () => reject(updateRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async deleteUser(email) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['users', 'conversations', 'messages'], 'readwrite');

            // Delete user
            const userStore = tx.objectStore('users');
            userStore.delete(email);

            // Delete all conversations for user
            const conversationStore = tx.objectStore('conversations');
            const conversationIndex = conversationStore.index('userEmail');
            const conversationRequest = conversationIndex.openCursor(IDBKeyRange.only(email));

            conversationRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const conversationId = cursor.value.id;
                    cursor.delete();

                    // Delete all messages in this conversation
                    const messageStore = tx.objectStore('messages');
                    const messageIndex = messageStore.index('conversationId');
                    const messageRequest = messageIndex.openCursor(IDBKeyRange.only(conversationId));

                    messageRequest.onsuccess = (e) => {
                        const messageCursor = e.target.result;
                        if (messageCursor) {
                            messageCursor.delete();
                            messageCursor.continue();
                        }
                    };

                    cursor.continue();
                }
            };

            tx.onerror = () => reject(tx.error);
            tx.oncomplete = () => resolve(true);
        });
    }

    _hashPassword(password) {
        // Simple hash - in production, use proper hashing
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
}

const db = new Database();
