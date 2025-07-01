// Dashboard JavaScript functionality

// API base URL
const API_BASE = '/api';

// Load dashboard data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
});

// Load all dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadStats(),
        loadMembers()
    ]);
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('total-members').textContent = data.total_members;
            document.getElementById('paid-members').textContent = data.paid_members;
            document.getElementById('unpaid-members').textContent = data.unpaid_members;
            document.getElementById('due-date').textContent = data.due_date || 'Not set';
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load members table
async function loadMembers() {
    try {
        const response = await fetch(`${API_BASE}/members`);
        const data = await response.json();
        
        if (response.ok) {
            renderMembersTable(data.members);
        }
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

// Render members table
function renderMembersTable(members) {
    const tbody = document.getElementById('member-table-body');
    
    if (!members || members.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <i class="fas fa-users text-4xl mb-2 block"></i>
                    No members found. Add your first member to get started.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = members.map(member => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${member.id}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${member.name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${member.phone_number}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.has_paid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }">
                    <i class="fas ${member.has_paid ? 'fa-check' : 'fa-times'} mr-1"></i>
                    ${member.has_paid ? 'PAID' : 'PENDING'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${member.last_payment ? new Date(member.last_payment).toLocaleDateString() : 'Never'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                ${!member.has_paid ? `
                    <button 
                        onclick="markAsPaid(${member.id})"
                        class="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <i class="fas fa-check mr-1"></i>
                        Mark Paid
                    </button>
                ` : `
                    <span class="text-green-600 text-xs font-medium">
                        <i class="fas fa-check-circle mr-1"></i>
                        Completed
                    </span>
                `}
            </td>
        </tr>
    `).join('');
}

// Mark member as paid
async function markAsPaid(memberId) {
    try {
        const response = await fetch(`${API_BASE}/members/${memberId}/pay`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Member marked as paid successfully!', 'success');
            loadDashboardData(); // Refresh data
        } else {
            showToast(data.error || 'Error marking member as paid', 'error');
        }
    } catch (error) {
        console.error('Error marking as paid:', error);
        showToast('Error marking member as paid', 'error');
    }
}

// Send reminders to unpaid members
async function sendReminders() {
    try {
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
        button.disabled = true;
        
        const response = await fetch(`${API_BASE}/send-reminders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast(`Reminders sent to ${data.sent} members!`, 'success');
        } else {
            showToast(data.error || 'Error sending reminders', 'error');
        }
        
        button.innerHTML = originalText;
        button.disabled = false;
        
    } catch (error) {
        console.error('Error sending reminders:', error);
        showToast('Error sending reminders', 'error');
        
        const button = event.target;
        button.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send Reminders';
        button.disabled = false;
    }
}

// Refresh dashboard
function refreshDashboard() {
    loadDashboardData();
    showToast('Dashboard refreshed!', 'success');
}

// Modal functions
function openAddMemberModal() {
    document.getElementById('add-member-modal').classList.remove('hidden');
}

function closeAddMemberModal() {
    document.getElementById('add-member-modal').classList.add('hidden');
    document.getElementById('add-member-form').reset();
}

// Add member form submission
document.getElementById('add-member-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('member-name').value.trim();
    const phone = document.getElementById('member-phone').value.trim();
    
    if (!name || !phone) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                phone_number: phone
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Member added successfully!', 'success');
            closeAddMemberModal();
            loadDashboardData(); // Refresh data
        } else {
            showToast(data.error || 'Error adding member', 'error');
        }
    } catch (error) {
        console.error('Error adding member:', error);
        showToast('Error adding member', 'error');
    }
});

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set color based on type
    if (type === 'success') {
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg transform translate-x-0 transition-transform duration-300 z-50';
    } else {
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg transform translate-x-0 transition-transform duration-300 z-50';
    }
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 3000);
}

// Close modal when clicking outside
document.getElementById('add-member-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAddMemberModal();
    }
});