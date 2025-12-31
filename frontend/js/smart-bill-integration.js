/**
 * Smart Bill & Reminder Center Integration
 * Handles bill management, reminders, and notifications
 */

class SmartBillManager {
    constructor() {
        this.bills = [];
        this.isInitialized = false;
        this.user = null;
    }

    /**
     * Initialize the Smart Bill Manager
     */
    async init() {
        if (this.isInitialized) {
            console.log('Smart Bill Manager already initialized');
            return;
        }
        
        try {
            console.log('Initializing Smart Bill Manager...');
            
            // Get user data
            this.user = JSON.parse(localStorage.getItem('user') || 'null');
            console.log('User data:', this.user);
            
            // Load bills from localStorage
            this.loadBills();
            
            // Set up form event listeners
            this.setupFormListeners();
            console.log('Form listeners set up');
            
            // Set up periodic reminder checks
            this.setupReminderChecks();
            console.log('Reminder checks set up');
            
            this.isInitialized = true;
            console.log('Smart Bill Manager initialized successfully');
        } catch (error) {
            console.error('Error initializing Smart Bill Manager:', error);
        }
    }

    /**
     * Load bills from localStorage
     */
    loadBills() {
        try {
            const storageKey = this.getUserStorageKey('bills');
            console.log('Loading bills with storage key:', storageKey);
            
            const savedBills = localStorage.getItem(storageKey);
            console.log('Saved bills data:', savedBills);
            
            if (savedBills) {
                this.bills = JSON.parse(savedBills);
                console.log(`Parsed ${this.bills.length} bills from storage`);
            } else {
                this.bills = [];
                console.log('No saved bills found, initialized empty array');
            }
            
            console.log('Current bills:', this.bills);
        } catch (error) {
            console.error('Error loading bills:', error);
            this.bills = [];
        }
    }

    /**
     * Save bills to localStorage
     */
    saveBills() {
        try {
            const storageKey = this.getUserStorageKey('bills');
            console.log('Saving bills with storage key:', storageKey);
            console.log('Bills to save:', this.bills);
            
            localStorage.setItem(storageKey, JSON.stringify(this.bills));
            console.log(`Successfully saved ${this.bills.length} bills`);
        } catch (error) {
            console.error('Error saving bills:', error);
        }
    }

    /**
     * Get user-specific storage key
     */
    getUserStorageKey(dataType) {
        if (this.user && this.user.id) {
            const key = `wealthEase_${this.user.id}_${dataType}`;
            console.log(`Generated user-specific storage key: ${key}`);
            return key;
        }
        const key = `wealthEase_${dataType}`;
        console.log(`Generated default storage key: ${key}`);
        return key;
    }

    /**
     * Setup form event listeners
     */
    setupFormListeners() {
        console.log('Setting up form event listeners...');
        const form = document.getElementById('smartBillForm');
        if (form) {
            console.log('Smart Bill Form found, adding event listener');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Form submitted');
                this.handleAddBill();
            });
        } else {
            console.error('Smart Bill Form not found!');
        }

        // Set default due date to tomorrow
        const dueDateInput = document.getElementById('billDueDate');
        if (dueDateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dueDateInput.value = tomorrow.toISOString().split('T')[0];
            console.log('Default due date set to tomorrow:', dueDateInput.value);
        } else {
            console.error('Due date input not found!');
        }
        
        console.log('Form event listeners setup completed');
    }

    /**
     * Handle add bill form submission
     */
    handleAddBill() {
        try {
            console.log('Handling add bill...');
            const formData = new FormData(document.getElementById('smartBillForm'));
            
            const bill = {
                id: Date.now(),
                name: formData.get('billName'),
                amount: parseFloat(formData.get('amount')),
                dueDate: formData.get('dueDate'),
                category: formData.get('category'),
                description: formData.get('description') || '',
                status: 'unpaid',
                createdAt: new Date().toISOString(),
                paidAt: null
            };

            console.log('Bill data:', bill);

            // Validate bill data
            if (!this.validateBill(bill)) {
                console.log('Bill validation failed');
                return;
            }

            console.log('Bill validation passed');

            // Add bill to array
            this.bills.push(bill);
            console.log(`Bill added to array. Total bills: ${this.bills.length}`);
            
            // Save to localStorage
            this.saveBills();
            
            // Update UI
            this.updateBillsList();
            this.updateStats();
            
            // Clear form
            this.clearForm();
            
            // Calculate days until due for notification
            const dueDate = new Date(bill.dueDate);
            const today = new Date();
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            let notificationMessage = `Bill "${bill.name}" added successfully!`;
            if (daysUntilDue === 0) {
                notificationMessage += ` Due today!`;
            } else if (daysUntilDue === 1) {
                notificationMessage += ` Due tomorrow!`;
            } else if (daysUntilDue <= 3) {
                notificationMessage += ` Due in ${daysUntilDue} days!`;
            } else {
                notificationMessage += ` Due in ${daysUntilDue} days.`;
            }
            
            console.log('Notification message:', notificationMessage);
            
            // Show success notification with due date info
            this.showNotification(notificationMessage, 'success');
            
            // Check for immediate reminders
            this.checkReminders();
            
        } catch (error) {
            console.error('Error adding bill:', error);
            this.showNotification('Failed to add bill. Please try again.', 'error');
        }
    }

    /**
     * Validate bill data
     */
    validateBill(bill) {
        console.log('Validating bill:', bill);
        
        if (!bill.name || bill.name.trim() === '') {
            console.log('Validation failed: Bill name is empty');
            this.showNotification('Please enter a bill name', 'error');
            return false;
        }
        
        if (!bill.amount || bill.amount <= 0) {
            console.log('Validation failed: Invalid amount');
            this.showNotification('Please enter a valid amount', 'error');
            return false;
        }
        
        if (!bill.dueDate) {
            console.log('Validation failed: No due date');
            this.showNotification('Please select a due date', 'error');
            return false;
        }
        
        if (!bill.category) {
            console.log('Validation failed: No category selected');
            this.showNotification('Please select a category', 'error');
            return false;
        }
        
        // Check if due date is in the past
        const dueDate = new Date(bill.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
            console.log('Validation failed: Due date is in the past');
            this.showNotification('Due date cannot be in the past', 'error');
            return false;
        }
        
        console.log('Bill validation passed');
        return true;
    }

    /**
     * Clear the bill form
     */
    clearForm() {
        console.log('Clearing form...');
        const form = document.getElementById('smartBillForm');
        if (form) {
            form.reset();
            console.log('Form reset');
            
            // Set default due date to tomorrow
            const dueDateInput = document.getElementById('billDueDate');
            if (dueDateInput) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                dueDateInput.value = tomorrow.toISOString().split('T')[0];
                console.log('Default due date set to tomorrow:', dueDateInput.value);
            }
        } else {
            console.error('Form not found for clearing');
        }
    }

    /**
     * Update bills list in UI
     */
    updateBillsList() {
        const billsList = document.getElementById('billsList');
        if (!billsList) {
            console.error('Bills list element not found!');
            return;
        }

        console.log(`Updating bills list with ${this.bills.length} bills`);

        if (this.bills.length === 0) {
            billsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-invoice"></i>
                    <h4>No Bills Yet</h4>
                    <p>Add your first bill to start tracking your expenses and due dates.</p>
                </div>
            `;
            return;
        }

        // Sort bills by due date (earliest first)
        const sortedBills = [...this.bills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        console.log('Sorted bills:', sortedBills);

        billsList.innerHTML = sortedBills.map(bill => this.createBillElement(bill)).join('');
        console.log('Bills list updated');
    }

    /**
     * Create bill element HTML
     */
    createBillElement(bill) {
        console.log(`Creating bill element for: ${bill.name}`);
        
        const dueDate = new Date(bill.dueDate);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        console.log(`Bill "${bill.name}" due in ${daysUntilDue} days`);
        
        const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;
        const isOverdue = daysUntilDue < 0;
        const isPaid = bill.status === 'paid';
        
        console.log(`Bill "${bill.name}" status: dueSoon=${isDueSoon}, overdue=${isOverdue}, paid=${isPaid}`);
        
        let dueDateClass = 'bill-due-date normal';
        let dueDateText = this.formatDate(dueDate);
        
        if (isOverdue) {
            dueDateClass = 'bill-due-date';
            dueDateText = `${Math.abs(daysUntilDue)} days overdue`;
        } else if (isDueSoon) {
            dueDateClass = 'bill-due-date';
            dueDateText = `${daysUntilDue} days left`;
        }

        const billElement = `
            <div class="bill-item ${isDueSoon ? 'due-soon' : ''} ${isPaid ? 'paid' : ''}">
                <div class="bill-header">
                    <div class="bill-info">
                        <h4>${this.escapeHtml(bill.name)}</h4>
                        <span class="bill-category">${this.escapeHtml(bill.category)}</span>
                    </div>
                    <div class="bill-amount">$${bill.amount.toFixed(2)}</div>
                </div>
                
                <div class="bill-details">
                    <div class="bill-detail">
                        <span class="bill-detail-label">Due Date</span>
                        <span class="bill-detail-value ${dueDateClass}">${dueDateText}</span>
                    </div>
                    <div class="bill-detail">
                        <span class="bill-detail-label">Status</span>
                        <span class="bill-detail-value">${isPaid ? 'Paid' : 'Unpaid'}</span>
                    </div>
                </div>
                
                ${bill.description ? `
                    <div class="bill-description">
                        <span class="bill-detail-label">Description</span>
                        <span class="bill-detail-value">${this.escapeHtml(bill.description)}</span>
                    </div>
                ` : ''}
                
                <div class="bill-actions">
                    ${!isPaid ? `
                        <button class="btn btn-mark-paid" onclick="smartBillManager.markAsPaid('${bill.id}')">
                            <i class="fas fa-check"></i>
                            Mark as Paid
                        </button>
                    ` : `
                        <button class="btn btn-mark-paid" onclick="smartBillManager.markAsUnpaid('${bill.id}')">
                            <i class="fas fa-undo"></i>
                            Mark as Unpaid
                        </button>
                    `}
                    <button class="btn btn-delete" onclick="smartBillManager.deleteBill('${bill.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;
        
        console.log(`Bill element created for: ${bill.name}`);
        return billElement;
    }

    /**
     * Update statistics
     */
    updateStats() {
        const totalBills = this.bills.length;
        const dueSoonBills = this.getDueSoonBills().length;
        
        console.log(`Updating stats: ${totalBills} total bills, ${dueSoonBills} due soon`);
        
        const totalBillsElement = document.getElementById('totalBills');
        const dueSoonBillsElement = document.getElementById('dueSoonBills');
        
        if (totalBillsElement) {
            totalBillsElement.textContent = totalBills;
            console.log('Total bills updated:', totalBills);
        } else {
            console.error('Total bills element not found!');
        }
        
        if (dueSoonBillsElement) {
            dueSoonBillsElement.textContent = dueSoonBills;
            console.log('Due soon bills updated:', dueSoonBills);
        } else {
            console.error('Due soon bills element not found!');
        }
    }

    /**
     * Get bills that are due soon (within 3 days)
     */
    getDueSoonBills() {
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);
        
        console.log('Checking due soon bills...');
        console.log('Today:', today.toDateString());
        console.log('Three days from now:', threeDaysFromNow.toDateString());
        
        const dueSoonBills = this.bills.filter(bill => {
            if (bill.status === 'paid') {
                console.log(`Bill "${bill.name}" is paid, skipping`);
                return false;
            }
            
            const dueDate = new Date(bill.dueDate);
            const isDueSoon = dueDate >= today && dueDate <= threeDaysFromNow;
            
            console.log(`Bill "${bill.name}" due on ${dueDate.toDateString()}, is due soon: ${isDueSoon}`);
            
            return isDueSoon;
        });
        
        console.log(`Found ${dueSoonBills.length} bills due soon:`, dueSoonBills.map(b => b.name));
        return dueSoonBills;
    }

    /**
     * Mark bill as paid
     */
    markAsPaid(billId) {
        console.log(`Marking bill ${billId} as paid...`);
        const bill = this.bills.find(b => b.id == billId);
        if (bill) {
            console.log(`Found bill: ${bill.name}`);
            bill.status = 'paid';
            bill.paidAt = new Date().toISOString();
            
            this.saveBills();
            this.updateBillsList();
            this.updateStats();
            
            this.showNotification(`Bill "${bill.name}" marked as paid!`, 'success');
            this.checkReminders();
        } else {
            console.error(`Bill with ID ${billId} not found!`);
        }
    }

    /**
     * Mark bill as unpaid
     */
    markAsUnpaid(billId) {
        console.log(`Marking bill ${billId} as unpaid...`);
        const bill = this.bills.find(b => b.id == billId);
        if (bill) {
            console.log(`Found bill: ${bill.name}`);
            bill.status = 'unpaid';
            bill.paidAt = null;
            
            this.saveBills();
            this.updateBillsList();
            this.updateStats();
            
            this.showNotification(`Bill "${bill.name}" marked as unpaid!`, 'info');
            this.checkReminders();
        } else {
            console.error(`Bill with ID ${billId} not found!`);
        }
    }

    /**
     * Delete bill
     */
    deleteBill(billId) {
        console.log(`Deleting bill ${billId}...`);
        const bill = this.bills.find(b => b.id == billId);
        if (bill && confirm(`Are you sure you want to delete "${bill.name}"?`)) {
            console.log(`Deleting bill: ${bill.name}`);
            this.bills = this.bills.filter(b => b.id != billId);
            
            this.saveBills();
            this.updateBillsList();
            this.updateStats();
            
            this.showNotification(`Bill "${bill.name}" deleted!`, 'info');
            this.checkReminders();
        } else if (!bill) {
            console.error(`Bill with ID ${billId} not found!`);
        } else {
            console.log('Bill deletion cancelled by user');
        }
    }

    /**
     * Check for reminders and show notifications
     */
    checkReminders() {
        console.log('Checking reminders...');
        const dueSoonBills = this.getDueSoonBills();
        
        if (dueSoonBills.length > 0) {
            const billNames = dueSoonBills.map(bill => bill.name).join(', ');
            const message = `Reminder: ${billNames} ${dueSoonBills.length === 1 ? 'is' : 'are'} due soon!`;
            console.log('Showing reminder notification:', message);
            this.showNotification(message, 'warning');
        } else {
            console.log('No bills due soon');
        }
    }

    /**
     * Setup periodic reminder checks
     */
    setupReminderChecks() {
        console.log('Setting up periodic reminder checks...');
        
        // Check reminders every 5 minutes
        const intervalId = setInterval(() => {
            console.log('Periodic reminder check triggered');
            this.checkReminders();
        }, 5 * 60 * 1000);
        
        // Initial check
        const timeoutId = setTimeout(() => {
            console.log('Initial reminder check triggered');
            this.checkReminders();
        }, 1000);
        
        console.log('Reminder checks set up successfully');
        console.log(`Interval ID: ${intervalId}, Timeout ID: ${timeoutId}`);
    }

    /**
     * Format date for display
     */
    formatDate(date) {
        const formatted = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        console.log(`Formatted date: ${date.toISOString()} -> ${formatted}`);
        return formatted;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        const escaped = div.innerHTML;
        console.log(`Escaped HTML: "${text}" -> "${escaped}"`);
        return escaped;
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        console.log(`Showing notification: "${message}" (type: ${type})`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22afa1' : type === 'error' ? '#ff6b6b' : type === 'warning' ? '#ffa726' : '#2196f3'};
            color: #0a0905;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Add to page
        document.body.appendChild(notification);
        console.log('Notification added to page');
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                    console.log('Notification removed from page');
                }
            }, 300);
        }, 3000);
    }

    /**
     * Load initial data when modal opens
     */
    loadInitialData() {
        console.log('Loading initial data...');
        this.loadBills();
        console.log(`Loaded ${this.bills.length} bills`);
        this.updateBillsList();
        this.updateStats();
        this.checkReminders();
        console.log('Initial data loading completed');
    }
}

// Global Smart Bill Manager instance
let smartBillManager = null;

// Global functions for modal control
function openSmartBillModal() {
    console.log('Opening Smart Bill Modal...');
    const modal = document.getElementById('smartBillModal');
    if (!modal) {
        console.error('Smart Bill Modal not found!');
        return;
    }
    
    modal.style.display = 'flex';
    console.log('Modal displayed');
    
    // Initialize Smart Bill Manager if not already done
    if (!smartBillManager) {
        smartBillManager = new SmartBillManager();
        console.log('Smart Bill Manager created');
    }
    
    // Initialize and load data when modal opens
    smartBillManager.init().then(() => {
        console.log('Smart Bill Manager initialized, loading data...');
        smartBillManager.loadInitialData();
    }).catch(error => {
        console.error('Error initializing Smart Bill Manager:', error);
    });
}

function closeSmartBillModal() {
    console.log('Closing Smart Bill Modal...');
    const modal = document.getElementById('smartBillModal');
    if (modal) {
        modal.style.display = 'none';
        console.log('Modal closed');
    } else {
        console.error('Modal not found for closing');
    }
}

function clearBillForm() {
    console.log('Clearing bill form...');
    if (smartBillManager) {
        smartBillManager.clearForm();
        console.log('Form cleared');
    } else {
        console.error('Smart Bill Manager not initialized');
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('smartBillModal');
    if (e.target === modal) {
        console.log('Modal clicked outside, closing...');
        closeSmartBillModal();
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Smart Bill Manager will be initialized when modal opens
    console.log('Smart Bill & Reminder Center ready');
    console.log('Page loaded, waiting for modal to open...');
});
