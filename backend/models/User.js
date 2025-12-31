// Simple in-memory User model for demo purposes
// In a real application, this would connect to a database

class User {
    constructor() {
        this.users = new Map();
        this.nextId = 1;
    }

    // Create a new user
    async create(userData) {
        const user = {
            id: this.nextId++,
            name: userData.name,
            email: userData.email,
            provider: userData.provider || 'email',
            googleId: userData.googleId || null,
            avatar: userData.avatar || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.users.set(user.id, user);
        return user;
    }

    // Find user by ID
    async findById(id) {
        return this.users.get(parseInt(id)) || null;
    }

    // Find user by email
    async findByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    // Find user by Google ID
    async findByGoogleId(googleId) {
        for (const user of this.users.values()) {
            if (user.googleId === googleId) {
                return user;
            }
        }
        return null;
    }

    // Find or create user
    async findOrCreate(userData) {
        let user = null;

        // Try to find existing user by email first
        if (userData.email) {
            user = await this.findByEmail(userData.email);
        }

        // If not found and has Google ID, try to find by Google ID
        if (!user && userData.googleId) {
            user = await this.findByGoogleId(userData.googleId);
        }

        // If still not found, create new user
        if (!user) {
            user = await this.create(userData);
        } else {
            // Update existing user with new data
            user = await this.update(user.id, {
                name: userData.name || user.name,
                googleId: userData.googleId || user.googleId,
                avatar: userData.avatar || user.avatar,
                provider: userData.provider || user.provider
            });
        }

        return user;
    }

    // Update user
    async update(id, updateData) {
        const user = this.users.get(parseInt(id));
        if (!user) {
            throw new Error('User not found');
        }

        const updatedUser = {
            ...user,
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        this.users.set(parseInt(id), updatedUser);
        return updatedUser;
    }

    // Delete user
    async delete(id) {
        const user = this.users.get(parseInt(id));
        if (!user) {
            throw new Error('User not found');
        }

        this.users.delete(parseInt(id));
        return true;
    }

    // Get all users (for admin purposes)
    async findAll() {
        return Array.from(this.users.values());
    }

    // Get user count
    async count() {
        return this.users.size;
    }

    // Search users
    async search(query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        for (const user of this.users.values()) {
            if (
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            ) {
                results.push(user);
            }
        }

        return results;
    }

    // Get users by provider
    async findByProvider(provider) {
        const results = [];
        for (const user of this.users.values()) {
            if (user.provider === provider) {
                results.push(user);
            }
        }
        return results;
    }

    // Get recent users
    async findRecent(limit = 10) {
        const allUsers = Array.from(this.users.values());
        return allUsers
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    // Validate user data
    validateUserData(userData) {
        const errors = [];

        if (!userData.email) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(userData.email)) {
            errors.push('Invalid email format');
        }

        if (!userData.name) {
            errors.push('Name is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Email validation helper
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Clear all users (for testing)
    async clear() {
        this.users.clear();
        this.nextId = 1;
    }
}

// Export singleton instance
module.exports = new User();
