/**
 * Chatbot AI Integration for WealthEase
 * Handles UI interactions and OpenAI integration for natural language transaction input
 */

class ChatbotManager {
    constructor() {
        this.dashboardManager = window.dashboardManager;
        this.isVisible = false;
        this.isOpen = false;
        this.isTyping = false;
        this.messages = [];
        this.user = null;
        this.init();
    }

    /**
     * Initialize the chatbot
     */
    init() {
        // Create chatbot UI
        this.createChatbotUI();
        
        // Add event listeners
        this.addEventListeners();
        
        // Load chat history from localStorage
        this.loadChatHistory();
        
        console.log('Chatbot initialized');
    }

    /**
     * Create chatbot UI elements
     */
    createChatbotUI() {
        // Create main container
        const chatbotWidget = document.createElement('div');
        chatbotWidget.className = 'chatbot-widget';
        
        // Create toggle button
        const chatbotToggle = document.createElement('div');
        chatbotToggle.className = 'chatbot-toggle';
        chatbotToggle.innerHTML = '<i class="fas fa-comment-dots"></i>';
        
        // Create chatbot container
        const chatbotContainer = document.createElement('div');
        chatbotContainer.className = 'chatbot-container';
        
        // Create chatbot header
        const chatbotHeader = document.createElement('div');
        chatbotHeader.className = 'chatbot-header';
        chatbotHeader.innerHTML = `
            <h3><i class="fas fa-robot"></i> WealthEase AI Assistant</h3>
            <button class="chatbot-close"><i class="fas fa-times"></i></button>
        `;
        
        // Create messages container
        const chatbotMessages = document.createElement('div');
        chatbotMessages.className = 'chatbot-messages';
        chatbotMessages.id = 'chatbot-messages';
        
        // Create input area
        const chatbotInput = document.createElement('div');
        chatbotInput.className = 'chatbot-input';
        chatbotInput.innerHTML = `
            <input type="text" placeholder="Type your transaction in USD... (e.g., Bought coffee $5)" id="chatbot-input-field">
            <button id="chatbot-send-btn"><i class="fas fa-paper-plane"></i></button>
        `;
        
        // Assemble the components
        chatbotContainer.appendChild(chatbotHeader);
        chatbotContainer.appendChild(chatbotMessages);
        chatbotContainer.appendChild(chatbotInput);
        
        chatbotWidget.appendChild(chatbotToggle);
        chatbotWidget.appendChild(chatbotContainer);
        
        // Add to document
        document.body.appendChild(chatbotWidget);
        
        // Store references
        this.chatbotWidget = chatbotWidget;
        this.chatbotToggle = chatbotToggle;
        this.chatbotContainer = chatbotContainer;
        this.chatbotMessages = chatbotMessages;
        this.chatbotInput = chatbotInput.querySelector('input');
        this.chatbotSendBtn = chatbotInput.querySelector('button');
    }

    /**
     * Add event listeners to chatbot elements
     */
    addEventListeners() {
        // Toggle chatbot
        this.chatbotToggle.addEventListener('click', () => this.toggleChatbot());
        
        // Close button
        const closeBtn = this.chatbotContainer.querySelector('.chatbot-close');
        closeBtn.addEventListener('click', () => this.toggleChatbot(false));
        
        // Send button
        this.chatbotSendBtn.addEventListener('click', () => this.sendMessage());
        
        // Input field (Enter key)
        this.chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Listen for dashboard manager
        window.addEventListener('dashboardReady', (e) => {
            this.dashboardManager = e.detail.dashboardManager;
            console.log('Chatbot connected to dashboard manager');
        });
    }

    /**
     * Toggle chatbot visibility
     */
    toggleChatbot(forceState) {
        const newState = forceState !== undefined ? forceState : !this.isOpen;
        this.isOpen = newState;
        
        if (this.isOpen) {
            this.chatbotContainer.classList.add('active');
            this.chatbotInput.focus();
            
            // Show welcome message if no messages
            if (this.messages.length === 0) {
                this.addBotMessage('👋 Hello! I\'m your WealthEase AI Assistant. You can type transactions like "Bought coffee $5" or "Received salary $3,500" and I\'ll automatically add them to your transaction list.');
            }
        } else {
            this.chatbotContainer.classList.remove('active');
        }
    }

    /**
     * Send user message to backend
     */
    async sendMessage() {
        const message = this.chatbotInput.value.trim();
        if (!message) return;
        
        // Clear input
        this.chatbotInput.value = '';
        
        // Add user message to UI
        this.addUserMessage(message);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to backend - gunakan port 3001 untuk AI server
            const response = await fetch('http://localhost:3001/api/ai/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            const result = await response.json();
            console.log('Chatbot response:', result);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            if (result.success && result.data) {
                // Add transaction to system
                const transactionAdded = await this.addTransactionFromChatbot(result.data);
                
                // Add bot response
                if (transactionAdded) {
                    this.addBotMessage(`✅ ${result.reply || 'Transaksi berhasil dicatat!'}`, 'success');
                } else {
                    this.addBotMessage(result.reply || 'Transaksi diterima tetapi gagal disimpan.', 'warning');
                }
            } else {
                // Add error message
                this.addBotMessage(result.error || 'Sorry, I couldn\'t understand that transaction. Try typing like: "Bought coffee $5" or "Received salary $3,500"', 'error');
            }
            
        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTypingIndicator();
            this.addBotMessage('❌ AI Server is not responding. Please make sure the backend server (ai-server.js) is running on port 3001.', 'error');
        }
        
        // Save chat history
        this.saveChatHistory();
    }

    /**
     * Add transaction from chatbot data
     */
    async addTransactionFromChatbot(data) {
        try {
            console.log('=== CHATBOT: Adding transaction ===');
            console.log('Data received:', data);
            
            // Validasi data
            if (!data.jumlah || isNaN(parseFloat(data.jumlah))) {
                console.error('❌ Invalid amount:', data.jumlah);
                return false;
            }
            
            if (!data.deskripsi) {
                console.error('❌ No description');
                return false;
            }
            
            // Convert data format to match dashboard
            const transaction = {
                id: Date.now().toString(),
                name: data.deskripsi,
                date: data.tanggal || new Date().toISOString().split('T')[0],
                type: data.tipe === 'pemasukan' ? 'income' : 'expense',
                amount: parseFloat(data.jumlah),
                category: this.getCategoryFromDescription(data.deskripsi, data.tipe),
                paymentMethod: data.paymentMethod || 'wallet', // Use AI's paymentMethod directly!
                description: data.deskripsi,
                createdAt: new Date().toISOString()
            };
            
            console.log('📝 Formatted transaction:', transaction);
            console.log('💳 Payment Method from AI:', data.paymentMethod);
            
            // Get dashboard manager
            const dashboardManager = window.dashboardManager || window.dashboard;
            
            console.log('🔍 Dashboard Manager found:', !!dashboardManager);
            
            if (dashboardManager) {
                console.log('✅ Using dashboard manager');
                console.log('Current transactions count:', dashboardManager.transactions.length);
                
                // Add transaction using dashboard manager
                dashboardManager.transactions.unshift(transaction);
                dashboardManager.sharedDataManager.saveTransactions(dashboardManager.transactions);
                
                console.log('💾 Transaction saved to array, new count:', dashboardManager.transactions.length);
                
                // Update UI
                dashboardManager.addTransactionToUI(transaction);
                dashboardManager.updateStatsCards();
                dashboardManager.updateCashflow();
                dashboardManager.updateTransactionList();
                
                console.log('🎨 UI updated');
                
                // Dispatch custom events for analytics dashboard
                window.dispatchEvent(new CustomEvent('transactionAdded', {
                    detail: { transaction, transactions: dashboardManager.transactions }
                }));
                
                window.dispatchEvent(new CustomEvent('dataUpdated', {
                    detail: { transactions: dashboardManager.transactions }
                }));
                
                console.log('📢 Events dispatched');
            } else {
                console.log('⚠️ Dashboard manager not available, using localStorage fallback');
                // Fallback: save to localStorage directly
                let transactions = JSON.parse(localStorage.getItem('wealthEase_transactions') || '[]');
                transactions.unshift(transaction);
                localStorage.setItem('wealthEase_transactions', JSON.stringify(transactions));
                console.log('💾 Transaction saved to localStorage (fallback)');
            }
            
            console.log('=== CHATBOT: Transaction added successfully ===');
            return true;
        } catch (error) {
            console.error('❌ Error adding transaction from chatbot:', error);
            return false;
        }
    }

    /**
     * Get category from description
     */
    getCategoryFromDescription(description, type) {
        const desc = description.toLowerCase();
        
        if (type === 'pemasukan') {
            if (desc.includes('gaji') || desc.includes('salary')) return 'salary';
            if (desc.includes('bonus')) return 'bonus';
            if (desc.includes('dividen') || desc.includes('dividend')) return 'investment';
            if (desc.includes('hadiah') || desc.includes('gift')) return 'gift';
            return 'other income';
        } else {
            if (desc.includes('makan') || desc.includes('makanan') || 
                desc.includes('kopi') || desc.includes('coffee') ||
                desc.includes('restoran') || desc.includes('restaurant')) return 'food';
            if (desc.includes('transport') || desc.includes('bensin') || 
                desc.includes('parkir') || desc.includes('taksi') || 
                desc.includes('taxi') || desc.includes('uber') ||
                desc.includes('ojek') || desc.includes('gojek')) return 'transportation';
            if (desc.includes('listrik') || desc.includes('electricity') ||
                desc.includes('air') || desc.includes('water') ||
                desc.includes('internet') || desc.includes('telepon') || 
                desc.includes('phone')) return 'bills';
            if (desc.includes('sewa') || desc.includes('rent') ||
                desc.includes('kost')) return 'housing';
            if (desc.includes('belanja') || desc.includes('shopping') ||
                desc.includes('baju') || desc.includes('clothes') || 
                desc.includes('sepatu') || desc.includes('shoes')) return 'shopping';
            if (desc.includes('dokter') || desc.includes('doctor') ||
                desc.includes('obat') || desc.includes('medicine') || 
                desc.includes('rumah sakit') || desc.includes('hospital')) return 'healthcare';
            if (desc.includes('hiburan') || desc.includes('entertainment') ||
                desc.includes('film') || desc.includes('movie') || 
                desc.includes('konser') || desc.includes('concert')) return 'entertainment';
            return 'other';
        }
    }
    
    /**
     * Get payment method from description (Cash or Wallet)
     */
    getPaymentMethodFromDescription(description) {
        const desc = description.toLowerCase();
        
        // Keywords for Cash
        if (desc.includes('cash') || desc.includes('tunai') || 
            desc.includes('uang') || desc.includes('money')) {
            return 'cash';
        }
        
        // Keywords for Digital Wallet
        if (desc.includes('wallet') || desc.includes('digital') ||
            desc.includes('gopay') || desc.includes('ovo') ||
            desc.includes('dana') || desc.includes('shopeepay') ||
            desc.includes('card') || desc.includes('debit') ||
            desc.includes('credit') || desc.includes('online')) {
            return 'wallet';
        }
        
        // Default to wallet for modern transactions
        return 'wallet';
    }

    /**
     * Add user message to UI
     */
    addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        messageElement.textContent = message;
        
        this.chatbotMessages.appendChild(messageElement);
        this.scrollToBottom();
        
        // Add to messages array
        this.messages.push({
            sender: 'user',
            text: message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Add bot message to UI
     */
    addBotMessage(message, type = '') {
        const messageElement = document.createElement('div');
        messageElement.className = `message bot ${type}`;
        messageElement.textContent = message;
        
        this.chatbotMessages.appendChild(messageElement);
        this.scrollToBottom();
        
        // Add to messages array
        this.messages.push({
            sender: 'bot',
            text: message,
            type: type,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = 'AI sedang memproses <span></span><span></span><span></span>';
        typingIndicator.id = 'typing-indicator';
        
        this.chatbotMessages.appendChild(typingIndicator);
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Scroll messages to bottom
     */
    scrollToBottom() {
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }

    /**
     * Save chat history to localStorage
     */
    saveChatHistory() {
        // Limit to last 50 messages
        const historyToSave = this.messages.slice(-50);
        localStorage.setItem(this.getChatStorageKey(), JSON.stringify(historyToSave));
    }

    /**
     * Load chat history from localStorage
     */
    loadChatHistory() {
        const savedHistory = localStorage.getItem(this.getChatStorageKey());
        if (savedHistory) {
            try {
                this.messages = JSON.parse(savedHistory);
                
                // Render messages
                this.chatbotMessages.innerHTML = '';
                this.messages.forEach(msg => {
                    if (msg.sender === 'user') {
                        this.addUserMessage(msg.text);
                    } else {
                        this.addBotMessage(msg.text, msg.type || '');
                    }
                });
            } catch (error) {
                console.error('Error loading chat history:', error);
                this.messages = [];
            }
        }
    }

    /**
     * Get user-specific storage key
     */
    getChatStorageKey() {
        if (this.user && this.user.id) {
            return `wealthEase_${this.user.id}_chatHistory`;
        }
        return 'wealthEase_guest_chatHistory';
    }

    /**
     * Clear chat history
     */
    clearChatHistory() {
        this.messages = [];
        this.chatbotMessages.innerHTML = '';
        localStorage.removeItem(this.getChatStorageKey());
        
        // Show welcome message
        this.addBotMessage('👋 Hello! I\'m your WealthEase AI Assistant. You can type transactions like "Bought coffee $5" or "Received salary $3,500" and I\'ll automatically add them to your transaction list.');
    }
}

// Initialize chatbot when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global chatbot instance
    window.chatbotManager = new ChatbotManager();
    
    // Notify dashboard when it's ready
    if (window.dashboard) {
        window.dispatchEvent(new CustomEvent('dashboardReady', {
            detail: { dashboardManager: window.dashboard }
        }));
    }
});