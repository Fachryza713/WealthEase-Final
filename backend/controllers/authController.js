const User = require('../models/User');

class AuthController {
    // Login with email and password
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Basic validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // For demo purposes, accept any email/password combination
            // In a real application, you would validate against a database
            const user = await User.findOrCreate({
                email: email,
                name: email.split('@')[0],
                provider: 'email'
            });

            // Create session
            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Login failed'
                    });
                }

                return res.json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        provider: user.provider
                    }
                });
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Google OAuth callback (updated for new flow)
    async googleCallback(req, res) {
        try {
            console.log('Google callback received:', req.body);
            console.log('Request origin:', req.headers.origin);
            console.log('Request headers:', req.headers);
            
            const { credential, user } = req.body;

            if (!credential) {
                console.log('No credential provided');
                return res.status(400).json({
                    success: false,
                    message: 'Google credential is required'
                });
            }

            console.log('Verifying Google token...');
            // Verify the Google JWT token
            const verifiedUser = await this.verifyGoogleToken(credential);
            
            if (!verifiedUser) {
                console.log('Token verification failed');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Google token'
                });
            }

            console.log('Token verified, user:', verifiedUser);

            // Find or create user in database
            const dbUser = await User.findOrCreate({
                email: verifiedUser.email,
                name: verifiedUser.name,
                provider: 'google',
                googleId: verifiedUser.sub,
                avatar: verifiedUser.picture
            });

            console.log('User found/created:', dbUser);

            // Create session
            req.login(dbUser, (err) => {
                if (err) {
                    console.error('Session creation error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Session creation failed',
                        error: err.message
                    });
                }

                console.log('Session created successfully');
                res.json({
                    success: true,
                    message: 'Google login successful',
                    user: {
                        id: dbUser.id,
                        name: dbUser.name,
                        email: dbUser.email,
                        provider: dbUser.provider,
                        avatar: dbUser.avatar
                    }
                });
            });

        } catch (error) {
            console.error('Google callback error:', error);
            res.status(500).json({
                success: false,
                message: 'Google login failed',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    // Verify Google JWT token
    async verifyGoogleToken(credential) {
        try {
            console.log('Decoding JWT token...');
            console.log('Credential length:', credential.length);
            console.log('Credential preview:', credential.substring(0, 50) + '...');
            
            // For production, you should verify the JWT signature with Google's public keys
            // For now, we'll decode and trust the token (not recommended for production)
            const payload = this.decodeJWT(credential);
            
            console.log('JWT payload:', payload);
            
            // Basic validation
            if (!payload.sub || !payload.email || !payload.name) {
                console.log('Missing required fields in JWT payload:', {
                    sub: payload.sub,
                    email: payload.email,
                    name: payload.name
                });
                return null;
            }

            // Check if token is expired
            if (payload.exp && payload.exp < Date.now() / 1000) {
                console.log('Token expired. Exp:', payload.exp, 'Now:', Date.now() / 1000);
                return null;
            }

            console.log('Token validation successful');
            return payload;
        } catch (error) {
            console.error('Token verification error:', error);
            return null;
        }
    }

    // Decode JWT token
    decodeJWT(token) {
        try {
            console.log('Decoding JWT token, length:', token.length);
            const parts = token.split('.');
            
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }
            
            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString());
            const payload = JSON.parse(jsonPayload);
            
            console.log('JWT decoded successfully');
            return payload;
        } catch (error) {
            console.error('JWT decode error:', error);
            throw new Error('Invalid token format');
        }
    }

    // Logout
    async logout(req, res) {
        try {
            req.logout((err) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Logout failed'
                    });
                }

                req.session.destroy((err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'Session destruction failed'
                        });
                    }

                    res.clearCookie('connect.sid');
                    res.json({
                        success: true,
                        message: 'Logout successful'
                    });
                });
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get authentication status
    async getAuthStatus(req, res) {
        try {
            if (req.isAuthenticated()) {
                res.json({
                    success: true,
                    authenticated: true,
                    user: {
                        id: req.user.id,
                        name: req.user.name,
                        email: req.user.email,
                        provider: req.user.provider
                    }
                });
            } else {
                res.json({
                    success: true,
                    authenticated: false,
                    user: null
                });
            }
        } catch (error) {
            console.error('Auth status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Register new user (for future implementation)
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Basic validation
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and password are required'
                });
            }

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Create new user
            const user = await User.create({
                name: name,
                email: email,
                provider: 'email'
            });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    provider: user.provider
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new AuthController();
