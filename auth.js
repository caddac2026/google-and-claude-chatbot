// auth.js - Authentication management

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
    }

    async signup(name, email, password, confirmPassword) {
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            throw new Error('All fields are required');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        if (!this._isValidEmail(email)) {
            throw new Error('Invalid email format');
        }

        // Check if user exists
        const existingUser = await db.getUser(email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Add user to database
        const user = await db.addUser(email, password, name);
        this.setCurrentUser(user);
        return user;
    }

    async login(email, password) {
        // Validation
        if (!email || !password) {
            throw new Error('Email and password required');
        }

        // Verify user
        const isValid = await db.verifyUser(email, password);
        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        // Get user data
        const user = await db.getUser(email);
        this.setCurrentUser(user);
        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    setCurrentUser(user) {
        this.currentUser = {
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    loadCurrentUser() {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
            } catch (e) {
                this.currentUser = null;
            }
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async deleteAccount(email) {
        await db.deleteUser(email);
        this.logout();
    }

    _isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}

const auth = new AuthManager();

// Form toggle function
function toggleAuthForm(event) {
    event.preventDefault();
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm.classList.contains('active')) {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    } else {
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}
