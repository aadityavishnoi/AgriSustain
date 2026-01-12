// Authentication and Session Management

// Demo user credentials
const users = {
    farmer: {
        username: 'farmer',
        password: 'farmer123',
        role: 'farmer',
        name: 'Rajesh Kumar',
        dashboard: 'farmer-dashboard.html'
    },
    helper: {
        username: 'helper',
        password: 'helper123',
        role: 'helper',
        name: 'Amit Singh',
        dashboard: 'helper-dashboard.html'
    },
    vendor: {
        username: 'vendor',
        password: 'vendor123',
        role: 'vendor',
        name: 'Priya Traders',
        dashboard: 'vendor-dashboard.html'
    },
    admin: {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'System Admin',
        dashboard: 'admin-dashboard.html'
    }
};

// Current selected role
let selectedRole = null;

// Role configurations
const roleConfig = {
    farmer: {
        icon: '🌾',
        title: 'Farmer Login',
        credentials: 'Username: farmer | Password: farmer123'
    },
    helper: {
        icon: '👷',
        title: 'Helper Login',
        credentials: 'Username: helper | Password: helper123'
    },
    vendor: {
        icon: '🏪',
        title: 'Vendor Login',
        credentials: 'Username: vendor | Password: vendor123'
    },
    admin: {
        icon: '⚙️',
        title: 'Admin Login',
        credentials: 'Username: admin | Password: admin123'
    }
};

// Select role function
function selectRole(role) {
    selectedRole = role;
    const config = roleConfig[role];

    // Hide role selection
    document.getElementById('roleSelection').style.display = 'none';

    // Show login form
    const loginForm = document.getElementById('loginForm');
    loginForm.style.display = 'block';

    // Update selected role display
    document.getElementById('selectedRoleIcon').textContent = config.icon;
    document.getElementById('selectedRoleTitle').textContent = config.title;
    document.getElementById('demoCredentials').textContent = config.credentials;

    // Clear form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Back to roles function
function backToRoles() {
    selectedRole = null;
    document.getElementById('roleSelection').style.display = 'grid';
    document.getElementById('loginForm').style.display = 'none';
}

// Handle login
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Find user
    const user = Object.values(users).find(
        u => u.username === username && u.password === password && u.role === selectedRole
    );

    if (user) {
        // Create session
        const session = {
            username: user.username,
            role: user.role,
            name: user.name,
            loginTime: new Date().toISOString()
        };

        // Store session
        if (rememberMe) {
            localStorage.setItem('agriSustainSession', JSON.stringify(session));
        } else {
            sessionStorage.setItem('agriSustainSession', JSON.stringify(session));
        }

        // Show success message
        showMessage('Login successful! Redirecting...', 'success');

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = user.dashboard;
        }, 1000);
    } else {
        showMessage('Invalid username or password!', 'error');
    }
}

// Show message function
function showMessage(message, type) {
    // Remove existing message if any
    const existingMsg = document.querySelector('.message-alert');
    if (existingMsg) {
        existingMsg.remove();
    }

    // Create message element
    const msgDiv = document.createElement('div');
    msgDiv.className = `message-alert ${type}`;
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        ${type === 'success' ? 'background: linear-gradient(135deg, #27ae60, #229954);' : 'background: linear-gradient(135deg, #e74c3c, #c0392b);'}
    `;

    document.body.appendChild(msgDiv);

    // Auto remove after 3 seconds
    setTimeout(() => {
        msgDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => msgDiv.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Check if already logged in
function checkExistingSession() {
    const session = getSession();
    if (session && window.location.pathname.includes('login.html')) {
        // Redirect to appropriate dashboard
        const user = users[session.role];
        if (user) {
            window.location.href = user.dashboard;
        }
    }
}

// Get session
function getSession() {
    const localSession = localStorage.getItem('agriSustainSession');
    const sessionSession = sessionStorage.getItem('agriSustainSession');

    if (localSession) {
        return JSON.parse(localSession);
    } else if (sessionSession) {
        return JSON.parse(sessionSession);
    }
    return null;
}

// Logout function
function logout() {
    localStorage.removeItem('agriSustainSession');
    sessionStorage.removeItem('agriSustainSession');
    window.location.href = 'index.html';
}

// Protect dashboard pages
function protectPage(requiredRole = null) {
    const session = getSession();

    if (!session) {
        // Not logged in, redirect to login
        window.location.href = 'login.html';
        return null;
    }

    if (requiredRole && session.role !== requiredRole) {
        // Wrong role, redirect to correct dashboard
        const user = users[session.role];
        if (user) {
            window.location.href = user.dashboard;
        }
        return null;
    }

    return session;
}

// Initialize
if (window.location.pathname.includes('login.html')) {
    checkExistingSession();
}

console.log('🔐 Authentication system initialized!');
