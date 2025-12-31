const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

class GoogleAuthConfig {
    configure() {
        // Configure Google OAuth Strategy
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                // Extract user information from Google profile
                const googleUser = {
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0].value,
                    provider: 'google'
                };

                // Find or create user
                const user = await User.findOrCreate({
                    email: googleUser.email,
                    name: googleUser.name,
                    provider: 'google',
                    googleId: googleUser.googleId,
                    avatar: googleUser.avatar
                });

                return done(null, user);
            } catch (error) {
                console.error('Google OAuth error:', error);
                return done(error, null);
            }
        }));

        // Serialize user for session
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        // Deserialize user from session
        passport.deserializeUser(async (id, done) => {
            try {
                const user = await User.findById(id);
                done(null, user);
            } catch (error) {
                console.error('Deserialize user error:', error);
                done(error, null);
            }
        });
    }

    // Get Google OAuth configuration
    getConfig() {
        return {
            clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
        };
    }

    // Validate Google OAuth setup
    validateSetup() {
        const config = this.getConfig();
        const missing = [];

        if (!config.clientID || config.clientID === 'your-google-client-id') {
            missing.push('GOOGLE_CLIENT_ID');
        }

        if (!config.clientSecret || config.clientSecret === 'your-google-client-secret') {
            missing.push('GOOGLE_CLIENT_SECRET');
        }

        if (missing.length > 0) {
            console.warn('⚠️  Google OAuth not configured. Missing:', missing.join(', '));
            console.warn('📝 To enable Google login, set the following environment variables:');
            missing.forEach(envVar => {
                console.warn(`   ${envVar}=your-${envVar.toLowerCase().replace('_', '-')}`);
            });
            return false;
        }

        console.log('✅ Google OAuth configured successfully');
        return true;
    }
}

module.exports = new GoogleAuthConfig();
