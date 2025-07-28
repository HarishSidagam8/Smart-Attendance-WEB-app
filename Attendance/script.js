let students = [];
let totalStudents = 0;
let subjects = [];
let subjectAttendance = {};
let currentSession = null;

function initializeClass() {
    const count = parseInt(document.getElementById('studentCount').value);

    if (!count || count < 1) {
        alert('Please enter a valid number of students');
        return;
    }

    totalStudents = count;
    students = [];
    subjects = [];
    subjectAttendance = {};

    // Generate roll numbers
    for (let i = 1; i <= count; i++) {
        students.push(i);
    }

    // Show subjects setup
    document.getElementById('subjectsSetup').style.display = 'block';
    document.getElementById('subjectsSetup').classList.add('fade-in');
    
    // Focus on subject name input
    document.getElementById('subjectName').focus();
}

function addSubject() {
    const name = document.getElementById('subjectName').value.trim();
    const hours = parseInt(document.getElementById('subjectHours').value);

    if (!name) {
        alert('Please enter a subject name');
        return;
    }

    if (!hours || hours < 1) {
        alert('Please enter valid hours (1-8)');
        return;
    }

    // Check if subject already exists
    if (subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
        alert('Subject already added');
        return;
    }

    const subject = { name, hours, id: Date.now() };
    subjects.push(subject);
    subjectAttendance[subject.id] = new Set();

    renderSubjectsList();
    
    // Clear inputs
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectHours').value = '';
    document.getElementById('subjectName').focus();
}

function renderSubjectsList() {
    const container = document.getElementById('subjectsList');
    container.innerHTML = subjects.map(subject => `
        <span class="subject-tag">
            ${subject.name} - ${subject.hours}hrs
            <button class="remove-btn" onclick="removeSubject(${subject.id})">×</button>
        </span>
    `).join('');
}

function removeSubject(subjectId) {
    subjects = subjects.filter(s => s.id !== subjectId);
    delete subjectAttendance[subjectId];
    renderSubjectsList();
}

function startAttendance() {
    if (subjects.length === 0) {
        alert('Please add at least one subject');
        return;
    }

    currentSession = {
        date: new Date().toLocaleString(),
        totalStudents: totalStudents,
        subjects: subjects.map(s => ({...s})),
        attendance: {}
    };

    renderAttendanceSections();
    
    // Hide setup sections and show attendance
    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('subjectsSetup').style.display = 'none';
    document.getElementById('attendanceSection').style.display = 'block';
    document.getElementById('attendanceSection').classList.add('fade-in');
}

function renderAttendanceSections() {
    const container = document.getElementById('subjectAttendanceList');
    container.innerHTML = subjects.map(subject => `
        <div class="subject-attendance">
            <div class="subject-header">
                <div class="subject-title">${subject.name}</div>
                <div class="subject-hours">${subject.hours} Hours</div>
            </div>
            
            <div class="controls-section">
                <div class="controls-grid">
                    <button class="btn btn-success btn-small" onclick="markAllPresent(${subject.id})">Mark All Present</button>
                    <button class="btn btn-warning btn-small" onclick="resetSubjectAttendance(${subject.id})">Reset</button>
                </div>
                
                <div class="search-box">
                    <span class="search-icon">🔍</span>
                    <input type="text" placeholder="Search by roll number..." oninput="searchStudents(${subject.id}, this.value)">
                </div>
            </div>
            
            <div class="students-grid" id="students-${subject.id}">
                ${students.map(rollNo => `
                    <button class="student-btn" id="student-${subject.id}-${rollNo}" onclick="toggleAttendance(${subject.id}, ${rollNo})">
                        ${rollNo}
                    </button>
                `).join('')}
            </div>
            
            <div class="subject-summary">
                <div class="summary-card card-present">
                    <div id="present-${subject.id}">${totalStudents}</div>
                    <div>Present</div>
                </div>
                <div class="summary-card card-absent">
                    <div id="absent-${subject.id}">0</div>
                    <div>Absent</div>
                </div>
                <div class="summary-card card-total">
                    <div>${totalStudents}</div>
                    <div>Total</div>
                </div>
            </div>
            
            <div class="absent-list" id="absent-list-${subject.id}" style="display: none;">
                <h4>❌ Absent Students:</h4>
                <p id="absent-students-${subject.id}"></p>
            </div>
        </div>
    `).join('');

    // Show export section
    document.getElementById('exportSection').style.display = 'block';
}

function toggleAttendance(subjectId, rollNo) {
    const btn = document.getElementById(`student-${subjectId}-${rollNo}`);
    
    if (subjectAttendance[subjectId].has(rollNo)) {
        subjectAttendance[subjectId].delete(rollNo);
        btn.classList.remove('absent');
    } else {
        subjectAttendance[subjectId].add(rollNo);
        btn.classList.add('absent');
    }
    
    updateSubjectSummary(subjectId);
}

function markAllPresent(subjectId) {
    subjectAttendance[subjectId].clear();
    students.forEach(rollNo => {
        document.getElementById(`student-${subjectId}-${rollNo}`).classList.remove('absent');
    });
    updateSubjectSummary(subjectId);
}

function resetSubjectAttendance(subjectId) {
    markAllPresent(subjectId);
}

function searchStudents(subjectId, searchTerm) {
    const term = searchTerm.toLowerCase();
    students.forEach(rollNo => {
        const btn = document.getElementById(`student-${subjectId}-${rollNo}`);
        if (rollNo.toString().includes(term)) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    });
}

function updateSubjectSummary(subjectId) {
    const absentCount = subjectAttendance[subjectId].size;
    const presentCount = totalStudents - absentCount;

    document.getElementById(`present-${subjectId}`).textContent = presentCount;
    document.getElementById(`absent-${subjectId}`).textContent = absentCount;

    const absentList = Array.from(subjectAttendance[subjectId]).sort((a, b) => a - b);
    const absentListElement = document.getElementById(`absent-list-${subjectId}`);
    
    if (absentCount > 0) {
        absentListElement.style.display = 'block';
        document.getElementById(`absent-students-${subjectId}`).textContent = absentList.join(', ');
    } else {
        absentListElement.style.display = 'none';
    }

    // Update session data
    if (currentSession) {
        currentSession.attendance[subjectId] = absentList;
    }
}

function saveSession() {
    if (!currentSession) return;

    // Update session with current attendance data
    subjects.forEach(subject => {
        currentSession.attendance[subject.id] = Array.from(subjectAttendance[subject.id]);
    });

    const sessions = JSON.parse(localStorage.getItem('attendanceSessions') || '[]');
    sessions.unshift(currentSession);
    
    // Keep only last 20 sessions
    if (sessions.length > 20) {
        sessions.splice(20);
    }
    
    localStorage.setItem('attendanceSessions', JSON.stringify(sessions));
    alert('Attendance session saved successfully!');
}

function showHistory() {
    const sessions = JSON.parse(localStorage.getItem('attendanceSessions') || '[]');
    const historyList = document.getElementById('historyList');
    
    if (sessions.length === 0) {
        historyList.innerHTML = '<p>No previous sessions found.</p>';
    } else {
        historyList.innerHTML = sessions.map((session, index) => {
            const totalAbsent = Object.values(session.attendance || {}).reduce((sum, absent) => sum + absent.length, 0);
            const subjectNames = session.subjects.map(s => s.name).join(', ');
            
            return `
                <div class="history-item" onclick="loadSession(${index})">
                    <strong>Date: ${session.date}</strong><br>
                    <small>Subjects: ${subjectNames}</small><br>
                    <small>Total Students: ${session.totalStudents} | Total Absences: ${totalAbsent}</small>
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('subjectsSetup').style.display = 'none';
    document.getElementById('attendanceSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'block';
}

function hideHistory() {
    document.getElementById('setupSection').style.display = 'block';
    document.getElementById('historySection').style.display = 'none';
}

function loadSession(index) {
    const sessions = JSON.parse(localStorage.getItem('attendanceSessions') || '[]');
    const session = sessions[index];
    
    // Load session data
    totalStudents = session.totalStudents;
    subjects = session.subjects.map(s => ({...s}));
    students = [];
    for (let i = 1; i <= totalStudents; i++) {
        students.push(i);
    }
    
    // Initialize attendance data
    subjectAttendance = {};
    subjects.forEach(subject => {
        subjectAttendance[subject.id] = new Set(session.attendance[subject.id] || []);
    });
    
    currentSession = {...session};
    
    // Set up UI
    document.getElementById('studentCount').value = totalStudents;
    hideHistory();
    
    // Show attendance section directly
    renderAttendanceSections();
    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('subjectsSetup').style.display = 'none';
    document.getElementById('attendanceSection').style.display = 'block';
    
    // Update all summaries
    subjects.forEach(subject => {
        updateSubjectSummary(subject.id);
    });
}

function generateAttendanceReport() {
    const date = new Date().toLocaleString();
    let report = `ATTENDANCE REPORT\n===================\nDate: ${date}\nTotal Students: ${totalStudents}\n\n`;
    
    subjects.forEach(subject => {
        const absentList = Array.from(subjectAttendance[subject.id]).sort((a, b) => a - b);
        const presentCount = totalStudents - absentList.length;
        
        report += `Subject: ${subject.name} (${subject.hours} hours)\n`;
        report += `Present: ${presentCount} | Absent: ${absentList.length}\n`;
        report += `Absent Students: ${absentList.length > 0 ? absentList.join(', ') : 'None'}\n\n`;
    });
    
    report += 'Generated by Smart Attendance System';
    return report;
}

function exportImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 900;
    canvas.height = 700 + (subjects.length * 100);
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('ATTENDANCE REPORT', 50, 50);
    
    // Date and basic info
    ctx.font = '18px Arial';
    ctx.fillText(`Date: ${new Date().toLocaleString()}`, 50, 90);
    ctx.fillText(`Total Students: ${totalStudents}`, 50, 120);
    
    let yPos = 170;
    
    subjects.forEach(subject => {
        const absentList = Array.from(subjectAttendance[subject.id]).sort((a, b) => a - b);
        const presentCount = totalStudents - absentList.length;
        
        // Subject header
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`${subject.name} (${subject.hours} hours)`, 50, yPos);
        
        // Stats
        ctx.fillStyle = '#333333';
        ctx.font = '16px Arial';
        ctx.fillText(`Present: ${presentCount} | Absent: ${absentList.length}`, 50, yPos + 30);
        ctx.fillText(`Absent Students: ${absentList.length > 0 ? absentList.join(', ') : 'None'}`, 50, yPos + 55);
        
        yPos += 100;
    });
    
    // Footer
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.fillText('Generated by Smart Attendance System', 50, canvas.height - 30);
    
    // Convert to blob and download
    canvas.toBlob(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('studentCount').focus();
    
    // Allow Enter key to add subjects
    document.getElementById('subjectName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('subjectHours').focus();
        }
    });
    
    document.getElementById('subjectHours').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addSubject();
        }
    });
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(reg => console.log('Service Worker Registered!', reg))
    .catch(err => console.error('Service Worker Error:', err));
}
