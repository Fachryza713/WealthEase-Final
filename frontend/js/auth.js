// Authentication JavaScript
class AuthManager {
    constructor() {
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.googleClientId = '779523586683-3sqe8kicc5g0gsmc21fg8lcnmvhmfh3e.apps.googleusercontent.com'; // Replace with actual client ID
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (this.isLoggedIn && this.user) {
            this.redirectToDashboard();
        }

        // Log current origin for debugging
        console.log('Current origin:', window.location.origin);
        console.log('Current URL:', window.location.href);
        console.log('Google Client ID:', this.googleClientId);
        console.log('Live Server detected:', window.location.port === '5500');

        // Initialize Google OAuth
        this.initializeGoogleOAuth();

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Google login fallback button
        const googleLoginFallbackBtn = document.getElementById('googleLoginFallback');
        if (googleLoginFallbackBtn) {
            googleLoginFallbackBtn.addEventListener('click', () => this.handleGoogleLoginFallback());
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    initializeGoogleOAuth() {
        // Wait for Google Identity Services to load
        if (typeof google !== 'undefined' && google.accounts) {
            console.log('Initializing Google OAuth with client ID:', this.googleClientId);

            google.accounts.id.initialize({
                client_id: this.googleClientId,
                callback: this.handleGoogleSignIn.bind(this),
                auto_select: false,
                cancel_on_tap_outside: true,
                context: 'signin',
                ux_mode: 'popup'
            });

            // Check for logout parameter to disable auto-select
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('logout') === 'true') {
                console.log('Logout detected, disabling auto-select');
                google.accounts.id.disableAutoSelect();

                // Clean up URL
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }

            // Update the client ID in the HTML
            const gIdOnload = document.getElementById('g_id_onload');
            if (gIdOnload) {
                gIdOnload.setAttribute('data-client_id', this.googleClientId);
            }

            // Render the Google Sign-In button
            google.accounts.id.renderButton(
                document.querySelector('.g_id_signin'),
                {
                    theme: 'outline',
                    size: 'large',
                    text: 'sign_in_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                    width: '100%'
                }
            );

            console.log('Google OAuth initialized successfully');
        } else {
            // Fallback if Google Identity Services doesn't load
            console.warn('Google Identity Services not loaded, using fallback');
            this.showFallbackButton();
        }
    }

    showFallbackButton() {
        const fallbackBtn = document.getElementById('googleLoginFallback');
        const googleSignIn = document.querySelector('.g_id_signin');

        if (fallbackBtn && googleSignIn) {
            fallbackBtn.style.display = 'block';
            googleSignIn.style.display = 'none';

            // Add click handler for fallback
            fallbackBtn.addEventListener('click', () => {
                this.handleGoogleLoginFallback();
            });
        }

        console.log('Fallback button shown due to Google OAuth issues');
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const loadingSpinner = submitBtn.querySelector('.loading-spinner');

        // Basic validation
        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        // Show loading state
        this.showLoading(submitBtn, btnText, loadingSpinner);

        try {
            // Simulate API call
            await this.simulateApiCall();

            // For demo purposes, accept any email/password combination
            const user = {
                id: 1,
                name: email.split('@')[0],
                email: email,
                provider: 'email'
            };

            this.loginSuccess(user);
        } catch (error) {
            this.showError('Login failed. Please try again.');
        } finally {
            this.hideLoading(submitBtn, btnText, loadingSpinner);
        }
    }

    async handleGoogleSignIn(response) {
        try {
            console.log('Google Sign-In response received:', response);

            // Decode the JWT token
            const payload = this.decodeJWT(response.credential);
            console.log('JWT payload decoded:', payload);

            // Extract user information
            const user = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                avatar: payload.picture,
                provider: 'google'
            };

            console.log('User data extracted:', user);

            // Try backend first, fallback to frontend-only if backend fails
            try {
                console.log('Sending request to backend...');
                const backendResponse = await fetch('http://localhost:3000/api/auth/google/callback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        credential: response.credential,
                        user: user
                    })
                });

                console.log('Backend response status:', backendResponse.status);

                if (backendResponse.ok) {
                    const result = await backendResponse.json();
                    console.log('Backend response data:', result);

                    if (result.success) {
                        this.loginSuccess(result.user);
                        return;
                    }
                }
            } catch (backendError) {
                console.warn('Backend not available, using frontend-only mode:', backendError.message);
            }

            // Frontend-only fallback
            console.log('Using frontend-only authentication...');
            this.loginSuccess(user);

        } catch (error) {
            console.error('Google Sign-In error:', error);
            this.showError('Google login failed. Please try again.');
        }
    }

    async handleGoogleLoginFallback() {
        try {
            // Fallback method for development/testing
            await this.simulateApiCall();

            const user = {
                id: Date.now(),
                name: 'Google User',
                email: 'user@gmail.com',
                provider: 'google'
            };

            this.loginSuccess(user);
        } catch (error) {
            this.showError('Google login failed. Please try again.');
        }
    }

    decodeJWT(token) {
        try {
            console.log('Decoding JWT token, length:', token.length);
            const parts = token.split('.');

            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);

            console.log('JWT decoded successfully');
            return payload;
        } catch (error) {
            console.error('JWT decode error:', error);
            throw new Error('Invalid token');
        }
    }

    handleLogout() {
        this.isLoggedIn = false;
        this.user = null;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');

        // Redirect to login page
        window.location.href = 'login.html';
    }

    loginSuccess(user) {
        this.isLoggedIn = true;
        this.user = user;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(user));

        // Show success message
        this.showSuccess('Login successful! Redirecting...');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
            this.redirectToDashboard();
        }, 1000);
    }

    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }

    showLoading(button, btnText, spinner) {
        button.disabled = true;
        btnText.style.opacity = '0';
        spinner.style.display = 'block';
    }

    hideLoading(button, btnText, spinner) {
        button.disabled = false;
        btnText.style.opacity = '1';
        spinner.style.display = 'none';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f87171' : '#4ade80'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    simulateApiCall() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('API Error'));
                }
            }, 1500);
        });
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Global callback function for Google Sign-In
window.handleGoogleSignIn = function (response) {
    if (window.authManager) {
        window.authManager.handleGoogleSignIn(response);
    }
};

// Signup Modal Functions
window.showSignupModal = function () {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
};

window.closeSignupModal = function () {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        // Reset form
        const form = document.getElementById('signupForm');
        if (form) {
            form.reset();
        }
    }
};

window.showHelp = function () {
    alert('For help with signing in:\n\n1. Make sure you\'re using the correct email and password\n2. Check if Caps Lock is on\n3. Try resetting your password\n4. Contact support if the problem persists');
};

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    /* Clean Google Section */
    .google-section-clean {
        width: 100%;
        margin: 1rem 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .google-button-wrapper {
        width: 100%;
        max-width: 300px;
        display: flex;
        justify-content: center;
    }
    
    .g_id_signin {
        width: 100% !important;
    }
    
    .g_id_signin iframe {
        width: 100% !important;
        height: 48px !important;
        border-radius: 8px !important;
        border: 1px solid #dadce0 !important;
        transition: all 0.2s ease !important;
    }
    
    .g_id_signin iframe:hover {
        box-shadow: 0 2px 8px rgba(66, 133, 244, 0.15) !important;
        border-color: #4285f4 !important;
        transform: translateY(-1px) !important;
    }
    
    /* Clean Google Button */
    .google-btn-clean {
        width: 100%;
        max-width: 300px;
        height: 48px;
        background: #fff;
        color: #3c4043;
        border: 1px solid #dadce0;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        font-family: 'Google Sans', 'Roboto', sans-serif;
        transition: all 0.2s ease;
        cursor: pointer;
        margin: 0 auto;
    }
    
    .google-btn-clean:hover {
        background: #f8f9fa;
        border-color: #4285f4;
        box-shadow: 0 2px 8px rgba(66, 133, 244, 0.15);
        transform: translateY(-1px);
    }
    
    .google-btn-clean:active {
        transform: translateY(0);
        box-shadow: 0 1px 4px rgba(66, 133, 244, 0.15);
    }
    
    .google-icon-clean {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .google-text-clean {
        font-weight: 500;
        letter-spacing: 0.25px;
    }
    
    /* Clean Divider Styling */
    .divider-clean {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 2rem 0;
        position: relative;
    }
    
    .divider-clean::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
    }
    
    .divider-text {
        background: #fff;
        padding: 0 16px;
        color: #6b7280;
        font-size: 14px;
        font-weight: 500;
        position: relative;
        z-index: 1;
    }
    
    /* Responsive Design */
    @media (max-width: 480px) {
        .g_id_signin iframe {
            height: 44px !important;
        }
        
        .google-btn-clean {
            height: 44px;
            font-size: 13px;
        }
        
        .divider-text {
            font-size: 13px;
            padding: 0 12px;
        }
        
        .google-icon-clean svg {
            width: 16px;
            height: 16px;
        }
    }
    
    /* Google Button Blue Theme Override */
    .g_id_signin iframe {
        background: #4285f4 !important;
        border: 1px solid #4285f4 !important;
        color: white !important;
    }
    
    /* Signup Section Styling */
    .login-footer {
        margin-top: 2rem;
        text-align: center;
    }
    
    .signup-section {
        margin-bottom: 1.5rem;
    }
    
    .signup-text {
        color: #6b7280;
        font-size: 14px;
        margin: 0 0 1rem 0;
    }
    
    .btn-signup {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .btn-signup:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .btn-signup:active {
        transform: translateY(0);
    }
    
    .login-help {
        margin-top: 1rem;
    }
    
    .help-link {
        color: #6b7280;
        text-decoration: none;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: color 0.3s ease;
    }
    
    .help-link:hover {
        color: #4285f4;
    }
    
    /* Modal Styling */
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    }
    
    .modal.show {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 400px;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideUp 0.3s ease-out;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #1f2937;
        font-size: 1.25rem;
        font-weight: 600;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }
    
    .modal-close:hover {
        background: #f3f4f6;
        color: #374151;
    }
    
    .modal-form {
        padding: 1.5rem;
    }
    
    .modal-actions {
        display: flex;
        gap: 12px;
        margin-top: 1.5rem;
    }
    
    .modal-actions .btn {
        flex: 1;
    }
    
    .checkbox-group {
        margin-top: 1rem;
    }
    
    .checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 13px;
        color: #6b7280;
        cursor: pointer;
        line-height: 1.4;
    }
    
    .checkbox-label input[type="checkbox"] {
        margin: 0;
        width: 16px;
        height: 16px;
        accent-color: #4285f4;
    }
    
    .terms-link, .privacy-link {
        color: #4285f4;
        text-decoration: none;
    }
    
    .terms-link:hover, .privacy-link:hover {
        text-decoration: underline;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Enhanced Google Button */
    .btn-google-enhanced {
        width: 100%;
        max-width: 300px;
        height: 52px;
        background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
        color: white;
        border: none;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        font-size: 15px;
        font-weight: 500;
        font-family: 'Google Sans', 'Roboto', sans-serif;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        margin: 0 auto;
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
    }
    
    .btn-google-enhanced:hover {
        background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
        box-shadow: 0 4px 16px rgba(66, 133, 244, 0.4);
        transform: translateY(-2px);
    }
    
    .btn-google-enhanced:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
    }
    
    .google-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border-radius: 6px;
        padding: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .google-icon {
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    }
    
    .google-text {
        font-weight: 500;
        letter-spacing: 0.25px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .google-shine {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s ease;
    }
    
    .btn-google-enhanced:hover .google-shine {
        left: 100%;
    }
    
    /* Google Button Blue Theme Override */
    .g_id_signin iframe {
        background: #4285f4 !important;
        border: 1px solid #4285f4 !important;
        color: white !important;
        box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3) !important;
        border-radius: 8px !important;
    }
    
    .g_id_signin iframe:hover {
        background: #1a73e8 !important;
        box-shadow: 0 4px 16px rgba(66, 133, 244, 0.4) !important;
        transform: translateY(-1px) !important;
    }
`;
document.head.appendChild(style);

