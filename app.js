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
    document.getElementById('menu-btn').addEventListener('click', openExportModal);
    
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
let scannedQualificationData = null;

function openAddQualificationModal() {
    const today = new Date().toISOString().split('T')[0];
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    document.getElementById('qualification-employee-name').value = currentEmployee ? currentEmployee.name : '';
    document.getElementById('qualification-title').value = '';
    document.getElementById('qualification-valid-from').value = today;
    document.getElementById('qualification-expiry').value = oneYearLater.toISOString().split('T')[0];
    document.getElementById('qualification-reminder').value = '30';
    document.getElementById('qualification-modal').classList.add('active');
}

function closeQualificationModal() {
    document.getElementById('qualification-modal').classList.remove('active');
    scannedQualificationData = null;
}

function saveQualification() {
    const employeeName = document.getElementById('qualification-employee-name').value.trim();
    const title = document.getElementById('qualification-title').value.trim();
    const validFrom = document.getElementById('qualification-valid-from').value;
    const expiryDate = document.getElementById('qualification-expiry').value;
    const notificationDays = parseInt(document.getElementById('qualification-reminder').value);
    
    if (!title || !validFrom || !expiryDate) {
        alert('Please fill in qualification title and dates');
        return;
    }
    
    if (new Date(expiryDate) <= new Date(validFrom)) {
        alert('Expiry date must be after valid from date');
        return;
    }
    
    // Check if employee name from scan matches current employee
    if (employeeName && currentEmployee && employeeName.toLowerCase() !== currentEmployee.name.toLowerCase()) {
        const confirmSwitch = confirm(`The scanned certificate is for "${employeeName}" but you're adding it to "${currentEmployee.name}". Do you want to:\n\nOK = Create/find employee "${employeeName}"\nCancel = Add to "${currentEmployee.name}" anyway`);
        
        if (confirmSwitch) {
            // Find or create employee with scanned name
            let targetEmployee = employees.find(e => e.name.toLowerCase() === employeeName.toLowerCase());
            
            if (!targetEmployee) {
                // Create new employee
                targetEmployee = {
                    id: generateId(),
                    name: employeeName,
                    department: 'General', // Default department
                    qualifications: []
                };
                employees.push(targetEmployee);
            }
            
            currentEmployee = targetEmployee;
        }
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

// Export Modal Functions
function openExportModal() {
    document.getElementById('export-modal').classList.add('active');
}

function closeExportModal() {
    document.getElementById('export-modal').classList.remove('active');
}

// Export to Excel (CSV)
function exportToExcel() {
    closeExportModal();
    
    // Create CSV content
    let csv = 'Employee Name,Department,Qualification,Valid From,Expiry Date,Days Until Expiry,Status\n';
    
    employees.forEach(emp => {
        if (emp.qualifications.length === 0) {
            csv += `"${emp.name}","${emp.department}","No qualifications","","","",""\n`;
        } else {
            emp.qualifications.forEach(qual => {
                const status = getQualificationStatus(qual.expiryDate, qual.notificationDays);
                const days = getDaysUntilExpiry(qual.expiryDate);
                const statusText = getStatusText(status);
                const daysText = days >= 0 ? days : `Expired ${Math.abs(days)} days ago`;
                
                csv += `"${emp.name}","${emp.department}","${qual.title}","${formatDate(qual.validFrom)}","${formatDate(qual.expiryDate)}","${daysText}","${statusText}"\n`;
            });
        }
    });
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `qualification-matrix-${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    showToast('✅ Excel file downloaded!');
}

// Export to PDF
function exportToPDF() {
    closeExportModal();
    
    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
        showToast('❌ PDF library not loaded. Please refresh the page.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Qualification Matrix Report', margin, yPos);
    yPos += 10;
    
    // Date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    const reportDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Generated: ${reportDate}`, margin, yPos);
    yPos += 15;
    
    // Summary Section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0);
    doc.text('Summary', margin, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const totalEmployees = employees.length;
    let totalQualifications = 0;
    let expiredCount = 0;
    let expiringCount = 0;
    
    employees.forEach(emp => {
        totalQualifications += emp.qualifications.length;
        emp.qualifications.forEach(qual => {
            const status = getQualificationStatus(qual.expiryDate, qual.notificationDays);
            if (status === 'expired') expiredCount++;
            if (status === 'expiring') expiringCount++;
        });
    });
    
    doc.text(`Total Employees: ${totalEmployees}`, margin, yPos);
    yPos += 5;
    doc.text(`Total Qualifications: ${totalQualifications}`, margin, yPos);
    yPos += 5;
    doc.setTextColor(255, 149, 0);
    doc.text(`⚠ Expiring Soon: ${expiringCount}`, margin, yPos);
    yPos += 5;
    doc.setTextColor(255, 59, 48);
    doc.text(`✕ Expired: ${expiredCount}`, margin, yPos);
    yPos += 15;
    
    doc.setTextColor(0);
    
    // Employee Details
    employees.forEach((emp, empIndex) => {
        // Check if we need a new page
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = margin;
        }
        
        // Employee header with background
        doc.setFillColor(240, 240, 247);
        doc.rect(margin, yPos - 5, pageWidth - (2 * margin), 10, 'F');
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${emp.name} - ${emp.department}`, margin + 2, yPos);
        yPos += 10;
        
        if (emp.qualifications.length === 0) {
            doc.setFontSize(9);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(150);
            doc.text('No qualifications recorded', margin + 5, yPos);
            doc.setTextColor(0);
            yPos += 10;
        } else {
            emp.qualifications.forEach((qual, qualIndex) => {
                // Check if we need a new page
                if (yPos > pageHeight - 30) {
                    doc.addPage();
                    yPos = margin;
                }
                
                const status = getQualificationStatus(qual.expiryDate, qual.notificationDays);
                const days = getDaysUntilExpiry(qual.expiryDate);
                
                // Qualification title
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(`• ${qual.title}`, margin + 5, yPos);
                
                // Status badge
                const statusText = getStatusText(status);
                doc.setFontSize(8);
                doc.setFont(undefined, 'bold');
                
                let badgeColor;
                if (status === 'valid') badgeColor = [52, 199, 89];
                else if (status === 'expiring') badgeColor = [255, 149, 0];
                else badgeColor = [255, 59, 48];
                
                const statusWidth = doc.getTextWidth(statusText) + 4;
                const statusX = pageWidth - margin - statusWidth;
                
                doc.setFillColor(...badgeColor);
                doc.roundedRect(statusX, yPos - 3, statusWidth, 5, 1, 1, 'F');
                doc.setTextColor(255);
                doc.text(statusText, statusX + 2, yPos);
                doc.setTextColor(0);
                
                yPos += 6;
                
                // Dates
                doc.setFontSize(9);
                doc.setFont(undefined, 'normal');
                doc.text(`Valid From: ${formatDate(qual.validFrom)}`, margin + 10, yPos);
                yPos += 4;
                
                if (status === 'expired') {
                    doc.setTextColor(255, 59, 48);
                }
                doc.text(`Expires: ${formatDate(qual.expiryDate)}`, margin + 10, yPos);
                doc.setTextColor(0);
                yPos += 4;
                
                // Days remaining
                doc.setFontSize(8);
                doc.setTextColor(150);
                const daysText = days >= 0 ? `${days} days remaining` : `Expired ${Math.abs(days)} days ago`;
                doc.text(daysText, margin + 10, yPos);
                doc.setTextColor(0);
                yPos += 8;
            });
        }
        
        yPos += 5;
    });
    
    // Footer on last page
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Generated by Qualification Tracker', margin, pageHeight - 10);
    
    // Save PDF
    const date = new Date().toISOString().split('T')[0];
    doc.save(`qualification-matrix-${date}.pdf`);
    
    // Show success message
    showToast('✅ PDF downloaded!');
}

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: slideUp 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2500);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Certificate Scanner Functions
function openCameraScanner() {
    document.getElementById('certificate-photo').click();
}

async function processCertificateImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Show loading
    document.getElementById('scan-loading').style.display = 'block';
    document.getElementById('manual-entry-fields').style.display = 'none';
    
    try {
        // Perform OCR
        const result = await Tesseract.recognize(file, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    console.log(`Progress: ${Math.round(m.progress * 100)}%`);
                }
            }
        });
        
        const extractedText = result.data.text;
        console.log('Extracted text:', extractedText);
        
        // Parse the extracted text
        const parsedData = parseConstructionCertificate(extractedText);
        
        // Hide loading
        document.getElementById('scan-loading').style.display = 'none';
        document.getElementById('manual-entry-fields').style.display = 'block';
        
        // Show confirmation modal
        showScanConfirmation(parsedData);
        
    } catch (error) {
        console.error('OCR Error:', error);
        document.getElementById('scan-loading').style.display = 'none';
        document.getElementById('manual-entry-fields').style.display = 'block';
        showToast('❌ Failed to scan certificate. Please enter manually.');
    }
    
    // Reset file input
    event.target.value = '';
}

function parseConstructionCertificate(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const data = {
        employeeName: '',
        qualificationTitle: '',
        validFrom: '',
        expiryDate: '',
        confidence: {
            name: 'low',
            title: 'low',
            validFrom: 'low',
            expiry: 'low'
        }
    };
    
    // Common construction qualification keywords
    const qualificationKeywords = [
        'CSCS', 'CPCS', 'NPORS', 'IPAF', 'PASMA', 'SMSTS', 'SSSTS',
        'First Aid', 'Asbestos', 'Manual Handling', 'Working at Height',
        'Scaffolding', 'Confined Space', 'Abrasive Wheels', 'Forklift',
        'Banksman', 'Slinger', 'Safety', 'Certificate', 'Card', 'Licence'
    ];
    
    // Try to find qualification type
    for (const line of lines) {
        const upperLine = line.toUpperCase();
        for (const keyword of qualificationKeywords) {
            if (upperLine.includes(keyword.toUpperCase())) {
                if (!data.qualificationTitle || line.length > data.qualificationTitle.length) {
                    data.qualificationTitle = line;
                    data.confidence.title = 'high';
                }
            }
        }
    }
    
    // Try to find name (usually after "Name:", "Holder:", or similar)
    const namePatterns = [
        /(?:Name|Holder|Cardholder|Employee)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
        /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/
    ];
    
    for (const line of lines) {
        for (const pattern of namePatterns) {
            const match = line.match(pattern);
            if (match) {
                const potentialName = match[1] || match[0];
                // Verify it looks like a name (2-4 words, capitalized)
                const words = potentialName.trim().split(/\s+/);
                if (words.length >= 2 && words.length <= 4 && 
                    words.every(w => /^[A-Z][a-z]+$/.test(w))) {
                    data.employeeName = potentialName.trim();
                    data.confidence.name = 'high';
                    break;
                }
            }
        }
        if (data.employeeName) break;
    }
    
    // Try to find dates
    const datePatterns = [
        /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,  // DD/MM/YYYY or DD-MM-YYYY
        /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,    // YYYY/MM/DD
        /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/gi  // DD Month YYYY
    ];
    
    const foundDates = [];
    for (const line of lines) {
        for (const pattern of datePatterns) {
            const matches = line.matchAll(pattern);
            for (const match of matches) {
                const dateStr = match[0];
                const parsedDate = parseFlexibleDate(dateStr);
                if (parsedDate) {
                    foundDates.push({
                        original: dateStr,
                        parsed: parsedDate,
                        line: line
                    });
                }
            }
        }
    }
    
    // Assign dates based on context
    for (const dateInfo of foundDates) {
        const lineLower = dateInfo.line.toLowerCase();
        
        if (lineLower.includes('expir') || lineLower.includes('valid to') || 
            lineLower.includes('valid until')) {
            data.expiryDate = dateInfo.parsed;
            data.confidence.expiry = 'high';
        } else if (lineLower.includes('issue') || lineLower.includes('valid from') || 
                   lineLower.includes('date of issue')) {
            data.validFrom = dateInfo.parsed;
            data.confidence.validFrom = 'high';
        }
    }
    
    // If we have dates but no clear labels, assume first is issue, last is expiry
    if (foundDates.length >= 2 && !data.expiryDate) {
        data.validFrom = foundDates[0].parsed;
        data.expiryDate = foundDates[foundDates.length - 1].parsed;
        data.confidence.validFrom = 'medium';
        data.confidence.expiry = 'medium';
    } else if (foundDates.length === 1 && !data.expiryDate) {
        data.expiryDate = foundDates[0].parsed;
        data.confidence.expiry = 'medium';
    }
    
    // Fallback: use current employee name if available
    if (!data.employeeName && currentEmployee) {
        data.employeeName = currentEmployee.name;
        data.confidence.name = 'medium';
    }
    
    return data;
}

function parseFlexibleDate(dateStr) {
    // Try various date formats
    const formats = [
        // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
        {
            regex: /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,
            parse: (m) => {
                let day = parseInt(m[1]);
                let month = parseInt(m[2]) - 1; // JS months are 0-indexed
                let year = parseInt(m[3]);
                if (year < 100) year += 2000;
                return new Date(year, month, day);
            }
        },
        // YYYY/MM/DD or YYYY-MM-DD
        {
            regex: /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,
            parse: (m) => {
                let year = parseInt(m[1]);
                let month = parseInt(m[2]) - 1;
                let day = parseInt(m[3]);
                return new Date(year, month, day);
            }
        },
        // DD Month YYYY
        {
            regex: /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})/i,
            parse: (m) => {
                const months = {
                    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
                    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
                };
                let day = parseInt(m[1]);
                let month = months[m[2].toLowerCase().substring(0, 3)];
                let year = parseInt(m[3]);
                if (year < 100) year += 2000;
                return new Date(year, month, day);
            }
        }
    ];
    
    for (const format of formats) {
        const match = dateStr.match(format.regex);
        if (match) {
            const date = format.parse(match);
            if (date && !isNaN(date.getTime())) {
                // Validate date is reasonable (between 1990 and 2050)
                if (date.getFullYear() >= 1990 && date.getFullYear() <= 2050) {
                    return date.toISOString().split('T')[0];
                }
            }
        }
    }
    
    return null;
}

function showScanConfirmation(data) {
    scannedQualificationData = data;
    
    const preview = document.getElementById('scanned-data-preview');
    
    const getConfidenceBadge = (level) => {
        return `<span class="confidence-badge confidence-${level}">${level === 'high' ? '✓' : level === 'medium' ? '?' : '!'}</span>`;
    };
    
    preview.innerHTML = `
        <div class="preview-item">
            <span class="preview-label">Employee Name</span>
            <span class="preview-value">
                ${data.employeeName || 'Not found'}
                ${data.employeeName ? getConfidenceBadge(data.confidence.name) : ''}
            </span>
        </div>
        <div class="preview-item">
            <span class="preview-label">Qualification</span>
            <span class="preview-value">
                ${data.qualificationTitle || 'Not found'}
                ${data.qualificationTitle ? getConfidenceBadge(data.confidence.title) : ''}
            </span>
        </div>
        <div class="preview-item">
            <span class="preview-label">Valid From</span>
            <span class="preview-value">
                ${data.validFrom ? formatDate(data.validFrom) : 'Not found'}
                ${data.validFrom ? getConfidenceBadge(data.confidence.validFrom) : ''}
            </span>
        </div>
        <div class="preview-item">
            <span class="preview-label">Expiry Date</span>
            <span class="preview-value">
                ${data.expiryDate ? formatDate(data.expiryDate) : 'Not found'}
                ${data.expiryDate ? getConfidenceBadge(data.confidence.expiry) : ''}
            </span>
        </div>
    `;
    
    document.getElementById('scan-confirm-modal').classList.add('active');
}

function closeScanConfirmModal() {
    document.getElementById('scan-confirm-modal').classList.remove('active');
}

function rejectScannedData() {
    closeScanConfirmModal();
    scannedQualificationData = null;
    // Clear and reopen scanner
    setTimeout(() => {
        openCameraScanner();
    }, 300);
}

function acceptScannedData() {
    if (!scannedQualificationData) return;
    
    const data = scannedQualificationData;
    
    // Fill in the form fields
    if (data.employeeName) {
        document.getElementById('qualification-employee-name').value = data.employeeName;
    }
    if (data.qualificationTitle) {
        document.getElementById('qualification-title').value = data.qualificationTitle;
    }
    if (data.validFrom) {
        document.getElementById('qualification-valid-from').value = data.validFrom;
    }
    if (data.expiryDate) {
        document.getElementById('qualification-expiry').value = data.expiryDate;
    }
    
    closeScanConfirmModal();
    showToast('✅ Data loaded! Please review and save.');
}


