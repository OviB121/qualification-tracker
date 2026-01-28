// Data Storage
let employees = [];
let currentEmployee = null;
let currentFilter = 'all';
let editingEmployeeId = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    renderEmployees();
    checkInstallPrompt();
    requestNotificationPermission();
});

// Event Listeners
function setupEventListeners() {
    // Main view buttons
    document.getElementById('add-employee-btn').addEventListener('click', openAddEmployeeModal);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderEmployees();
        });
    });
    
    // Search
    document.getElementById('search-input').addEventListener('input', renderEmployees);
    
    // Detail view buttons
    document.getElementById('back-btn').addEventListener('click', showMainView);
    document.getElementById('edit-employee-btn').addEventListener('click', openEditEmployeeModal);
    
    // Modal buttons
    document.getElementById('save-employee-btn').addEventListener('click', saveEmployee);
    document.getElementById('save-qualification-btn').addEventListener('click', saveQualification);
}

// Data Management
function loadData() {
    const saved = localStorage.getItem('qualificationTrackerData');
    if (saved) {
        employees = JSON.parse(saved);
    } else {
        loadSampleData();
    }
}

function saveData() {
    localStorage.setItem('qualificationTrackerData', JSON.stringify(employees));
    scheduleNotifications();
}

function loadSampleData() {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const in45Days = new Date(today);
    in45Days.setDate(today.getDate() + 45);
    
    const in185Days = new Date(today);
    in185Days.setDate(today.getDate() + 185);
    
    const expired = new Date(today);
    expired.setDate(today.getDate() - 10);
    
    const in275Days = new Date(today);
    in275Days.setDate(today.getDate() + 275);
    
    employees = [
        {
            id: generateId(),
            name: 'John Smith',
            department: 'Safety',
            qualifications: [
                {
                    id: generateId(),
                    title: 'First Aid Certificate',
                    validFrom: oneYearAgo.toISOString().split('T')[0],
                    expiryDate: in45Days.toISOString().split('T')[0],
                    notificationDays: 30
                },
                {
                    id: generateId(),
                    title: 'Fire Safety Training',
                    validFrom: oneYearAgo.toISOString().split('T')[0],
                    expiryDate: in185Days.toISOString().split('T')[0],
                    notificationDays: 30
                }
            ]
        },
        {
            id: generateId(),
            name: 'Sarah Johnson',
            department: 'Operations',
            qualifications: [
                {
                    id: generateId(),
                    title: 'Forklift License',
                    validFrom: oneYearAgo.toISOString().split('T')[0],
                    expiryDate: expired.toISOString().split('T')[0],
                    notificationDays: 30
                },
                {
                    id: generateId(),
                    title: 'Health & Safety',
                    validFrom: oneYearAgo.toISOString().split('T')[0],
                    expiryDate: in275Days.toISOString().split('T')[0],
                    notificationDays: 30
                }
            ]
        }
    ];
    
    saveData();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Qualification Status
function getQualificationStatus(expiryDate, notificationDays) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
        return 'expired';
    } else if (daysUntilExpiry <= notificationDays) {
        return 'expiring';
    }
    return 'valid';
}

function getDaysUntilExpiry(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

function getStatusText(status) {
    const statusMap = {
        'valid': 'Valid',
        'expiring': 'Expiring Soon',
        'expired': 'Expired'
    };
    return statusMap[status];
}

// Rendering
function renderEmployees() {
    const container = document.getElementById('employee-list');
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    let filtered = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm) || 
                            emp.department.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
        
        if (currentFilter === 'all') return true;
        
        return emp.qualifications.some(qual => {
            const status = getQualificationStatus(qual.expiryDate, qual.notificationDays);
            return status === currentFilter;
        });
    });
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <h3>No Employees Found</h3>
                <p>${searchTerm ? 'Try a different search term' : 'Add your first employee to get started'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(emp => {
        const warningCount = emp.qualifications.filter(q => {
            const status = getQualificationStatus(q.expiryDate, q.notificationDays);
            return status === 'expiring' || status === 'expired';
        }).length;
        
        return `
            <div class="employee-card" onclick="showEmployeeDetail('${emp.id}')">
                <div class="employee-header">
                    <div class="employee-info">
                        <h3>${emp.name}</h3>
                        <p>${emp.department}</p>
                    </div>
                    ${warningCount > 0 ? `
                        <div class="warning-badge">
                            ⚠️ ${warningCount}
                        </div>
                    ` : ''}
                </div>
                <div class="qualification-chips">
                    ${emp.qualifications.map(qual => {
                        const status = getQualificationStatus(qual.expiryDate, qual.notificationDays);
                        return `
                            <div class="qualification-chip ${status}">
                                <div class="status-dot ${status}"></div>
                                <span>${qual.title}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function showEmployeeDetail(employeeId) {
    currentEmployee = employees.find(e => e.id === employeeId);
    if (!currentEmployee) return;
    
    const container = document.getElementById('employee-detail');
    
    container.innerHTML = `
        <div class="detail-section">
            <h3>Employee Information</h3>
            <div class="detail-row">
                <span class="detail-label">Name</span>
                <span class="detail-value">${currentEmployee.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Department</span>
                <span class="detail-value">${currentEmployee.department}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>Qualifications</h3>
            ${currentEmployee.qualifications.map(qual => {
                const status = getQualificationStatus(qual.expiryDate, qual.notificationDays);
                const days = getDaysUntilExpiry(qual.expiryDate);
                
                return `
                    <div class="qualification-item">
                        <button class="delete-qualification-btn" onclick="deleteQualification('${qual.id}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                        <div class="qualification-header">
                            <div class="qualification-title">${qual.title}</div>
                            <div class="status-badge ${status}">${getStatusText(status)}</div>
                        </div>
                        <div class="qualification-dates">
                            <div class="date-item">
                                <div class="date-label">Valid From</div>
                                <div class="date-value">${formatDate(qual.validFrom)}</div>
                            </div>
                            <div class="date-item expiry">
                                <div class="date-label">Expires</div>
                                <div class="date-value ${status === 'expired' ? 'expired' : ''}">${formatDate(qual.expiryDate)}</div>
                            </div>
                        </div>
                        <div class="days-remaining ${status === 'expired' ? 'expired' : ''}">
                            ${days >= 0 ? `${days} days remaining` : `Expired ${Math.abs(days)} days ago`}
                        </div>
                    </div>
                `;
            }).join('')}
            
            <button class="add-qualification-btn" onclick="openAddQualificationModal()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Qualification
            </button>
        </div>
        
        <div class="detail-section">
            <button class="delete-employee-btn" onclick="deleteEmployee()">
                Delete Employee
            </button>
        </div>
    `;
    
    showDetailView();
}

// Navigation
function showMainView() {
    document.getElementById('main-view').classList.add('active');
    document.getElementById('detail-view').classList.remove('active');
    renderEmployees();
}

function showDetailView() {
    document.getElementById('main-view').classList.remove('active');
    document.getElementById('detail-view').classList.add('active');
}

// Employee Modals
function openAddEmployeeModal() {
    editingEmployeeId = null;
    document.getElementById('employee-modal-title').textContent = 'Add Employee';
    document.getElementById('employee-name').value = '';
    document.getElementById('employee-department').value = '';
    document.getElementById('employee-modal').classList.add('active');
}

function openEditEmployeeModal() {
    if (!currentEmployee) return;
    
    editingEmployeeId = currentEmployee.id;
    document.getElementById('employee-modal-title').textContent = 'Edit Employee';
    document.getElementById('employee-name').value = currentEmployee.name;
    document.getElementById('employee-department').value = currentEmployee.department;
    document.getElementById('employee-modal').classList.add('active');
}

function closeEmployeeModal() {
    document.getElementById('employee-modal').classList.remove('active');
}

function saveEmployee() {
    const name = document.getElementById('employee-name').value.trim();
    const department = document.getElementById('employee-department').value.trim();
    
    if (!name || !department) {
        alert('Please fill in all fields');
        return;
    }
    
    if (editingEmployeeId) {
        // Edit existing employee
        const employee = employees.find(e => e.id === editingEmployeeId);
        if (employee) {
            employee.name = name;
            employee.department = department;
            currentEmployee = employee;
            showEmployeeDetail(employee.id);
        }
    } else {
        // Add new employee
        const newEmployee = {
            id: generateId(),
            name,
            department,
            qualifications: []
        };
        employees.push(newEmployee);
        renderEmployees();
    }
    
    saveData();
    closeEmployeeModal();
}

function deleteEmployee() {
    if (!currentEmployee) return;
    
    openDeleteModal(
        `Are you sure you want to delete ${currentEmployee.name}? This will also delete all their qualifications.`,
        () => {
            employees = employees.filter(e => e.id !== currentEmployee.id);
            saveData();
            showMainView();
        }
    );
}

// Qualification Modals
function openAddQualificationModal() {
    const today = new Date().toISOString().split('T')[0];
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    document.getElementById('qualification-title').value = '';
    document.getElementById('qualification-valid-from').value = today;
    document.getElementById('qualification-expiry').value = oneYearLater.toISOString().split('T')[0];
    document.getElementById('qualification-reminder').value = '30';
    document.getElementById('qualification-modal').classList.add('active');
}

function closeQualificationModal() {
    document.getElementById('qualification-modal').classList.remove('active');
}

function saveQualification() {
    const title = document.getElementById('qualification-title').value.trim();
    const validFrom = document.getElementById('qualification-valid-from').value;
    const expiryDate = document.getElementById('qualification-expiry').value;
    const notificationDays = parseInt(document.getElementById('qualification-reminder').value);
    
    if (!title || !validFrom || !expiryDate) {
        alert('Please fill in all fields');
        return;
    }
    
    if (new Date(expiryDate) <= new Date(validFrom)) {
        alert('Expiry date must be after valid from date');
        return;
    }
    
    const newQualification = {
        id: generateId(),
        title,
        validFrom,
        expiryDate,
        notificationDays
    };
    
    currentEmployee.qualifications.push(newQualification);
    saveData();
    showEmployeeDetail(currentEmployee.id);
    closeQualificationModal();
}

function deleteQualification(qualId) {
    if (!currentEmployee) return;
    
    const qual = currentEmployee.qualifications.find(q => q.id === qualId);
    if (!qual) return;
    
    openDeleteModal(
        `Are you sure you want to delete the qualification "${qual.title}"?`,
        () => {
            currentEmployee.qualifications = currentEmployee.qualifications.filter(q => q.id !== qualId);
            saveData();
            showEmployeeDetail(currentEmployee.id);
        }
    );
}

// Delete Confirmation Modal
function openDeleteModal(message, onConfirm) {
    document.getElementById('delete-message').textContent = message;
    document.getElementById('delete-modal').classList.add('active');
    
    const confirmBtn = document.getElementById('confirm-delete-btn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        closeDeleteModal();
    });
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
}

// Utilities
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Notifications
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
        });
    }
}

function scheduleNotifications() {
    // Note: Web apps have limited background notification capabilities
    // This is a simplified version that checks when the app is opened
    checkExpiringQualifications();
}

function checkExpiringQualifications() {
    if ('Notification' in window && Notification.permission === 'granted') {
        employees.forEach(emp => {
            emp.qualifications.forEach(qual => {
                const days = getDaysUntilExpiry(qual.expiryDate);
                const status = getQualificationStatus(qual.expiryDate, qual.notificationDays);
                
                // Show notification if expiring soon or expired
                if (status === 'expiring' && days > 0 && days <= qual.notificationDays) {
                    showNotification(
                        'Qualification Expiring Soon',
                        `${emp.name}'s ${qual.title} expires in ${days} days`
                    );
                } else if (status === 'expired' && days >= -7) { // Only for recently expired
                    showNotification(
                        'Qualification Expired',
                        `${emp.name}'s ${qual.title} expired ${Math.abs(days)} days ago`
                    );
                }
            });
        });
    }
}

function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: 'icon-192.png',
            badge: 'icon-192.png'
        });
    }
}

// Install Prompt
function checkInstallPrompt() {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if user has dismissed the prompt before
    const promptDismissed = localStorage.getItem('installPromptDismissed');
    
    // Show prompt only on iOS Safari and if not dismissed
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && isSafari && !isInstalled && !promptDismissed) {
        setTimeout(() => {
            document.getElementById('install-prompt').style.display = 'block';
        }, 3000);
    }
}

function dismissInstallPrompt() {
    document.getElementById('install-prompt').style.display = 'none';
    localStorage.setItem('installPromptDismissed', 'true');
}

// Check for expiring qualifications on app load
window.addEventListener('load', () => {
    setTimeout(checkExpiringQualifications, 2000);
});
