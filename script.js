document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login');
    const registerForm = document.getElementById('register');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const authSection = document.getElementById('auth-section');
    const dashboard = document.getElementById('dashboard');
    const logoutBtn = document.getElementById('logout');

    if (localStorage.getItem('loggedInUser')) {
        showDashboard();
    }

    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });

    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const id = document.getElementById('login-id').value;
        const password = document.getElementById('login-password').value;

        const users = JSON.parse(localStorage.getItem('users')) || {};
        const user = users[username];
        if (user && user.password === password && user.id === id) {
            localStorage.setItem('loggedInUser', username);
            showDashboard();
        } else {
            alert('Invalid username, ID, or password');
        }
    });

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const role = document.getElementById('register-role').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (!role) {
            alert('Please select a role');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[username]) {
            alert('Username already exists');
            return;
        }

        if (role === 'admin') {
            const existingAdmin = Object.values(users).some(u => u && u.role === 'admin');
            if (existingAdmin) {
                alert('Admin account already exists. Only one admin account is allowed.');
                return;
            }
        }

        const id = Math.random().toString(36).substr(2, 9).toUpperCase();
        users[username] = { password: password, role: role, id: id };
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registration successful! Your ID is: ' + id + '. Please login.');
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('loggedInUser');
        showAuth();
    });

    function showDashboard() {
        const username = localStorage.getItem('loggedInUser');
        const users = JSON.parse(localStorage.getItem('users')) || {};
        const user = users[username];
        const role = user && typeof user === 'object' ? user.role : 'Employee';
        
        if (!user.workInfo) {
            user.workInfo = {
                salary: role === 'admin' ? '₱50,000' : '₱25,000',
                schedule: 'Monday-Friday, 9AM-5PM',
                presentDays: 20,
                absentDays: 1
            };
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        if (user.workInfo.attendance && !user.workInfo.presentDays) {
            user.workInfo.presentDays = 20;
            user.workInfo.absentDays = 1;
            delete user.workInfo.attendance;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        const editButton = role === 'admin' ? '<button id="edit-work-info" class="edit-btn">Edit</button>' : '';
        
        const workInfoSection = role !== 'admin' ? `
            <div class="work-info">
                <div class="work-info-header">
                    <h3>Work Information</h3>
                    ${editButton}
                </div>
                <table class="info-table" id="work-info-table">
                    <tr>
                        <th>Category</th>
                        <th>Details</th>

                    <tr>
                        <td>Salary (Pay Roll)</td>
                        <td>${user.workInfo.salary}</td>
                    </tr>
                    <tr>
                        <td>Schedule</td>
                        <td>${user.workInfo.schedule}</td>
                    </tr>
                    <tr>
                        <td>Attendance</td>
                        <td>Present: ${user.workInfo.presentDays} days, Absent: ${user.workInfo.absentDays} days</td>
                    </tr>
                </table>
                <div id="edit-form" style="display: none;">
                    <input type="text" id="edit-salary" placeholder="Salary" value="${user.workInfo.salary}">
                    <input type="text" id="edit-schedule" placeholder="Schedule" value="${user.workInfo.schedule}">
                    <input type="number" id="edit-present-days" placeholder="Present Days" value="${user.workInfo.presentDays}">
                    <input type="number" id="edit-absent-days" placeholder="Absent Days" value="${user.workInfo.absentDays}">
                    <button id="save-btn" class="save-btn">Save</button>
                    <button id="cancel-btn" class="cancel-btn">Cancel</button>
                </div>
            </div>
        ` : '';
        
        const adminPanel = role === 'admin' ? `
            <div class="admin-panel">
                <h3>Admin Panel: Edit Employee Accounts</h3>
                <select id="user-select">
                    <option value="">Select Employee</option>
                    ${Object.keys(users).filter(u => users[u].role === 'employee').map(u => `<option value="${u}">${u}</option>`).join('')}
                </select>
                <button id="load-user-btn" class="edit-btn">Load User</button>
                <div id="user-info" style="display: none;">
                    <div class="work-info-header">
                        <h3 id="user-info-title">User Information</h3>
                        <button id="edit-user-work-info" class="edit-btn">Edit</button>
                    </div>
                    <table class="info-table" id="user-info-table">
                        <tr>
                            <th>Category</th>
                            <th>Details</th>
                        </tr>
                        <tr>
                            <td>Username</td>
                            <td id="user-username"></td>
                        </tr>
                        <tr>
                            <td>Role</td>
                            <td id="user-role"></td>
                        </tr>
                        <tr>
                            <td>ID</td>
                            <td id="user-id"></td>
                        </tr>
                        <tr>
                            <td>Salary (Pay Roll)</td>
                            <td id="user-salary"></td>
                        </tr>
                        <tr>
                            <td>Schedule</td>
                            <td id="user-schedule"></td>
                        </tr>
                        <tr>
                            <td>Attendance</td>
                            <td id="user-attendance"></td>
                        </tr>
                    </table>
                    <div id="edit-user-form" style="display: none;">
                        <input type="text" id="edit-user-salary" placeholder="Salary">
                        <input type="text" id="edit-user-schedule" placeholder="Schedule">
                        <input type="number" id="edit-user-present-days" placeholder="Present Days">
                        <input type="number" id="edit-user-absent-days" placeholder="Absent Days">
                        <button id="save-user-btn" class="save-btn">Save</button>
                        <button id="cancel-user-btn" class="cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
        ` : '';
        
        document.getElementById('dashboard').innerHTML = `
            <h2>Welcome to the Dashboard</h2>
            <p>You are logged in as: ${username} (${role})</p>
            <p>ID: ${user.id}</p>
            ${workInfoSection}
            ${adminPanel}
            <button id="logout">Logout</button>
        `;
        authSection.style.display = 'none';
        dashboard.style.display = 'block';

        document.getElementById('logout').addEventListener('click', function() {
            localStorage.removeItem('loggedInUser');
            showAuth();
        });
        
        if (role === 'admin') {
            
            const loadUserBtn = document.getElementById('load-user-btn');
            const userSelect = document.getElementById('user-select');
            const userInfo = document.getElementById('user-info');
            const editUserBtn = document.getElementById('edit-user-work-info');
            const saveUserBtn = document.getElementById('save-user-btn');
            const cancelUserBtn = document.getElementById('cancel-user-btn');
            const userTable = document.getElementById('user-info-table');
            const editUserForm = document.getElementById('edit-user-form');

            loadUserBtn.addEventListener('click', function() {
                const selectedUser = userSelect.value;
                if (!selectedUser) {
                    alert('Please select a user');
                    return;
                }
                const selectedUserData = users[selectedUser];
                document.getElementById('user-username').textContent = selectedUser;
                document.getElementById('user-role').textContent = selectedUserData.role;
                document.getElementById('user-id').textContent = selectedUserData.id;
                document.getElementById('user-salary').textContent = selectedUserData.workInfo.salary;
                document.getElementById('user-schedule').textContent = selectedUserData.workInfo.schedule;
                document.getElementById('user-attendance').textContent = `Present: ${selectedUserData.workInfo.presentDays} days, Absent: ${selectedUserData.workInfo.absentDays} days`;
                document.getElementById('edit-user-salary').value = selectedUserData.workInfo.salary;
                document.getElementById('edit-user-schedule').value = selectedUserData.workInfo.schedule;
                document.getElementById('edit-user-present-days').value = selectedUserData.workInfo.presentDays;
                document.getElementById('edit-user-absent-days').value = selectedUserData.workInfo.absentDays;
                userInfo.style.display = 'block';
            });

            editUserBtn.addEventListener('click', function() {
                userTable.style.display = 'none';
                editUserForm.style.display = 'block';
            });

            cancelUserBtn.addEventListener('click', function() {
                userTable.style.display = 'table';
                editUserForm.style.display = 'none';
            });

            saveUserBtn.addEventListener('click', function() {
                const selectedUser = userSelect.value;
                const updatedUsers = JSON.parse(localStorage.getItem('users'));
                updatedUsers[selectedUser].workInfo = {
                    salary: document.getElementById('edit-user-salary').value,
                    schedule: document.getElementById('edit-user-schedule').value,
                    presentDays: parseInt(document.getElementById('edit-user-present-days').value),
                    absentDays: parseInt(document.getElementById('edit-user-absent-days').value)
                };
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                
                const selectedUserData = updatedUsers[selectedUser];
                document.getElementById('user-salary').textContent = selectedUserData.workInfo.salary;
                document.getElementById('user-schedule').textContent = selectedUserData.workInfo.schedule;
                document.getElementById('user-attendance').textContent = `Present: ${selectedUserData.workInfo.presentDays} days, Absent: ${selectedUserData.workInfo.absentDays} days`;
                userTable.style.display = 'table';
                editUserForm.style.display = 'none';
            });
        }
    }

    function showAuth() {
        dashboard.style.display = 'none';
        authSection.style.display = 'block';
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
    }
});
