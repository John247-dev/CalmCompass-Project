// Data storage
let historyData = JSON.parse(localStorage.getItem('history')) || [];
let streak = localStorage.getItem('streak') || 0;
let lastDate = localStorage.getItem('lastDate') || null;
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
let chartInstance = null;
let currentAudio = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateHistory();
    updateStreak();
    updateCompass();
});

// Compass functionality
function updateCompass() {
    if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', (event) => {
            const compass = document.getElementById('compass-icon');
            const heading = event.webkitCompassHeading || event.alpha;
            if (heading !== null) {
                compass.style.transform = `rotate(${-heading}deg)`;
            }
        });
    } else {
        let angle = 0;
        setInterval(() => {
            angle = (angle + 1) % 360;
            document.getElementById('compass-icon').style.transform = `rotate(${angle}deg)`;
        }, 50);
    }
}

// Save trigger and provide suggestion
function saveTrigger() {
    const trigger = document.getElementById('trigger').value;
    const tag = document.getElementById('tag').value;
    const mood = document.getElementById('mood').value;
    if (trigger) {
        const entry = { trigger, tag, mood, date: new Date().toLocaleString() };
        historyData.push(entry);
        localStorage.setItem('history', JSON.stringify(historyData));
        updateHistory();
        document.getElementById('trigger').value = '';
        provideSuggestion(trigger, tag, mood);
        updateMoodData(mood);
        updateStreak();
    }
}

function provideSuggestion(trigger, tag, mood) {
    const suggestions = {
        happy: `Yay, you're happy about ${tag}! How about sharing that joy with a friend today?`,
        anxious: `Anxious about ${tag}? Try this: breathe in for 4, hold for 4, exhale for 4. Feel better?`,
        tired: `Tired from ${tag}? Take a moment to rest with some ocean waves—want to try?`,
        angry: `Angry about ${tag}? Let’s release it: imagine blowing it away with each breath.`,
        calm: `Calm amidst ${tag}? Perfect—enhance it with forest sounds or a quiet moment.`
    };
    document.getElementById('suggestion').textContent = suggestions[mood] || 'Tell me more!';
}

// Guided breathing exercise
function startBreathing() {
    const duration = parseInt(document.getElementById('breathing-duration').value);
    const soundToggle = document.getElementById('sound-toggle').checked;
    const timer = document.getElementById('timer');
    let timeLeft = duration;
    timer.textContent = `Inhale... (${timeLeft}s)`;

    if (soundToggle) {
        stopBackgroundSound();
        currentAudio = document.getElementById('waves-sound');
        currentAudio.play();
    }

    let phase = 'inhale';
    const interval = setInterval(() => {
        timeLeft--;
        if (phase === 'inhale' && timeLeft <= duration / 2) {
            phase = 'exhale';
            timer.textContent = `Exhale... (${timeLeft}s)`;
        } else if (timeLeft <= 0) {
            clearInterval(interval);
            timer.textContent = 'Well done!';
            if (soundToggle) currentAudio.pause();
        } else {
            timer.textContent = `${phase === 'inhale' ? 'Inhale' : 'Exhale'}... (${timeLeft}s)`;
        }
    }, 1000);
}

// Sleep tips
function showSleepTips() {
    const tips = [
        'Dim the lights and play some rain sounds.',
        'Avoid caffeine after 3 PM—try herbal tea!',
        'Keep a notepad by your bed to jot down thoughts.',
        'Stretch gently before lying down.'
    ];
    document.getElementById('sleep-tips').textContent = tips[Math.floor(Math.random() * tips.length)];
}

// Background sound control
function playBackgroundSound() {
    const sound = document.getElementById('bg-sound').value;
    stopBackgroundSound();
    currentAudio = document.getElementById(`${sound}-sound`);
    currentAudio.play().catch(err => console.log("Audio play failed:", err));
}

function stopBackgroundSound() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
}

// AI Chat
function sendMessage() {
    const input = document.getElementById('chat-input').value;
    const fileInput = document.getElementById('chat-file');
    const chatBox = document.getElementById('chat-box');

    if (input || fileInput.files.length > 0) {
        const userMessage = document.createElement('p');
        userMessage.className = 'user-message';
        userMessage.textContent = input || 'Attached a file';
        chatBox.appendChild(userMessage);

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.style.maxWidth = '200px';
                chatBox.appendChild(img);
            } else if (file.type.startsWith('audio/')) {
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.src = URL.createObjectURL(file);
                chatBox.appendChild(audio);
            }
        }

        setTimeout(() => {
            const aiResponse = document.createElement('p');
            aiResponse.className = 'ai-message';
            aiResponse.textContent = generateAIResponse(input, fileInput.files[0]);
            chatBox.appendChild(aiResponse);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, adjustResponseSpeed());

        document.getElementById('chat-input').value = '';
        fileInput.value = '';
    }
}

function generateAIResponse(input, file) {
    if (file) {
        if (file.type.startsWith('image/')) return `Wow, nice image! What’s the story behind it?`;
        if (file.type.startsWith('audio/')) return `I heard your voice—tell me more about what’s on your mind!`;
    }
    if (!input) return 'What’s up? I’m here to help!';
    if (input.toLowerCase().includes('stress')) return `Stress, huh? Let’s breathe it out—try the guided breathing tool!`;
    if (input.toLowerCase().includes('sleep')) return `Sleep troubles? How about rain sounds and a dark room?`;
    return `You said: "${input}". Let’s tackle it—any ideas on what might help?`;
}

function adjustResponseSpeed() {
    const speed = document.getElementById('response-speed').value;
    return { fast: 300, normal: 1000, slow: 2000 }[speed];
}

// Mood chart
function updateMoodData(mood) {
    const date = new Date().toLocaleDateString();
    moodData[date] = moodData[date] || {};
    moodData[date][mood] = (moodData[date][mood] || 0) + 1;
    localStorage.setItem('moodData', JSON.stringify(moodData));
}

function showMoodChart() {
    const ctx = document.getElementById('moodChart').getContext('2d');
    const labels = Object.keys(moodData);
    const moods = ['happy', 'anxious', 'tired', 'angry', 'calm'];
    const datasets = moods.map(mood => ({
        label: mood,
        data: labels.map(date => moodData[date][mood] || 0),
        backgroundColor: {
            happy: 'rgba(255, 235, 59, 0.5)',
            anxious: 'rgba(244, 67, 54, 0.5)',
            tired: 'rgba(100, 181, 246, 0.5)',
            angry: 'rgba(255, 152, 0, 0.5)',
            calm: 'rgba(129, 199, 132, 0.5)'
        }[mood]
    }));

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: { scales: { y: { beginAtZero: true } } }
    });
    canvas.style.display = 'block';
}

// History and sharing
function updateHistory() {
    const historyList = document.getElementById('history');
    historyList.innerHTML = '';
    historyData.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.date}: ${entry.trigger} (${entry.tag}, ${entry.mood})`;
        historyList.appendChild(li);
    });
}

function downloadHistory() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyData));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'calmcompass_history.json');
    a.click();
}

function shareHistory() {
    const text = historyData.map(entry => `${entry.date}: ${entry.trigger} (${entry.tag}, ${entry.mood})`).join('\n');
    if (navigator.share) {
        navigator.share({
            title: 'My CalmCompass Journey',
            text: text,
            url: window.location.href
        }).catch(err => alert('Sharing failed: ' + err));
    } else {
        alert('Copy this to share:\n' + text);
    }
}

// Streak and reminders
function updateStreak() {
    const today = new Date().toLocaleDateString();
    if (lastDate && lastDate !== today) {
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString();
        if (lastDate === yesterday) streak++;
        else streak = 1;
    } else if (!lastDate) {
        streak = 1;
    }
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastDate', today);
    document.getElementById('streak').textContent = `Streak: ${streak} days`;
}

function toggleReminder() {
    const enabled = document.getElementById('daily-reminder').checked;
    if (enabled) {
        setInterval(() => {
            document.getElementById('daily-tip').textContent = 'Take a deep breath—how’s your day going?';
        }, 24 * 60 * 60 * 1000);
    }
}

// Background change
function changeBackground() {
    const bgImage = document.getElementById('bg-image').value;
    const backgrounds = {
        nature1: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        nature2: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
        nature3: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        nature4: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99'
    };
    document.body.style.backgroundImage = `url('${backgrounds[bgImage]}')`;
}

// Authentication
let users = JSON.parse(localStorage.getItem('users')) || {};

function showAuthModal(type) {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('auth-form');
    modal.style.display = 'block';
    title.textContent = type === 'login' ? 'Login' : 'Signup';
    form.onsubmit = type === 'login' ? handleLogin : handleSignup;
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('auth-message').textContent = '';
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (users[username] && users[username].password === password) {
        document.getElementById('auth-message').textContent = 'Login successful!';
        setTimeout(closeAuthModal, 1000);
    } else {
        document.getElementById('auth-message').textContent = 'Invalid credentials.';
    }
}

function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (!users[username]) {
        users[username] = { password };
        localStorage.setItem('users', JSON.stringify(users));
        document.getElementById('auth-message').textContent = 'Signup successful! Please login.';
    } else {
        document.getElementById('auth-message').textContent = 'Username already exists.';
    }
}

function showForgotPassword() {
    const username = prompt('Enter your username:');
    if (users[username]) {
        alert(`Your password is: ${users[username].password}`);
    } else {
        alert('Username not found.');
    }
}

function sendInvite() {
    const email = document.getElementById('invite-email').value;
    if (email) {
        const inviteLink = `${window.location.href}?ref=${Math.random().toString(36).substring(2, 11)}`;
        if (navigator.share) {
            navigator.share({
                title: 'Join CalmCompass!',
                text: `Hey! Join me on CalmCompass for a calmer life: ${inviteLink}`,
                url: inviteLink
            }).catch(err => alert('Invite failed: ' + err));
        } else {
            alert(`Invite your friend with this link: ${inviteLink}`);
        }
        document.getElementById('invite-email').value = '';
    } else {
        alert('Please enter an email address.');
    }
}
