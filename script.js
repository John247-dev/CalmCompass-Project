// Data storage
let historyData = JSON.parse(localStorage.getItem('history')) || [];
let streak = localStorage.getItem('streak') || 0;
let lastDate = localStorage.getItem('lastDate') || null;
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};
let chartInstance = null;
let currentAudio = null;
let users = JSON.parse(localStorage.getItem('users')) || {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateHistory();
    updateStreak();
});

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
        calm: `Calm amidst ${tag}? Perfect—enhance it with forest sounds or a quiet moment.`,
        sad: `Feeling sad about ${tag}? It’s okay—try some rainfall sounds or share what’s on your mind in the chat.`,
    };
    document.getElementById('suggestion').textContent = suggestions[mood] || 'Tell me more!';
}

// Guided breathing exercise (adjusted timing)
function startBreathing() {
    const duration = parseInt(document.getElementById('breathing-duration').value);
    const soundToggle = document.getElementById('sound-toggle').checked;
    const reminderToggle = document.getElementById('breathing-reminder').checked;
    const timer = document.getElementById('timer');
    let timeLeft = duration;
    let inhaleTime = Math.floor(duration / 2); // Equal inhale/exhale
    let exhaleTime = duration - inhaleTime;
    let phase = 'inhale';
    timer.textContent = `Inhale... (${inhaleTime}s)`;

    if (soundToggle) {
        stopBackgroundSound();
        currentAudio = document.getElementById('waves-sound');
        currentAudio.play();
    }

    const interval = setInterval(() => {
        timeLeft--;
        if (phase === 'inhale' && timeLeft < exhaleTime) {
            phase = 'exhale';
            timer.textContent = `Exhale... (${timeLeft}s)`;
        } else if (timeLeft <= 0) {
            clearInterval(interval);
            timer.textContent = 'Well done!';
            if (soundToggle) currentAudio.pause();
            if (reminderToggle) setTimeout(() => alert('Time for another breathing session!'), 60 * 60 * 1000);
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

// AI Chat (enhanced reasoning)
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
            }
        }

        setTimeout(() => {
            const aiResponse = document.createElement('p');
            aiResponse.className = 'ai-message';
            aiResponse.textContent = generateAIResponse(input, fileInput.files[0]);
            chatBox.appendChild(aiResponse);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 1000); // Fixed normal response speed

        document.getElementById('chat-input').value = '';
        fileInput.value = '';
    }
}

function generateAIResponse(input, file) {
    if (file && file.type.startsWith('image/')) {
        return `I see your image! It looks like something’s bothering you—can you tell me more so I can assist you better?`;
    }
    if (!input) return 'Hey, I’m here to help—feeling stressed, anxious, or something else?';
    if (input.toLowerCase().includes('stress') || input.toLowerCase().includes('anxiety')) {
        return `It sounds like you’re dealing with some ${input.toLowerCase().includes('stress') ? 'stress' : 'anxiety'}. How about trying the guided breathing exercise for 1 minute? It can help calm your mind. Or, tell me more about what’s going on—I’m here to listen.`;
    }
    if (input.toLowerCase().includes('sleep')) {
        return `Struggling with sleep? Try the rain sounds under Calming Tools and keep your room cool and dark. Want more tips?`;
    }
    if (input.toLowerCase().includes('burnout')) {
        return `Burnout can be tough. Take a break with some forest ambience and track your mood daily—it might reveal patterns. Want to talk it out or connect with a counselor?`;
    }
    return `You mentioned "${input}". I’m here to support you—could it be related to work, health, or something else? Let’s figure it out together!`;
}

// Toggle Chat Modal
function toggleChat() {
    const modal = document.getElementById('chat-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
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
    document.getElementById('moodChart').style.display = 'block'; // Ensure visibility
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

// Streak
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
function showAuthModal(type) {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('auth-form');
    modal.style.display = 'block';
    title.textContent = type === 'login' ? 'Login' : 'Signup';
    form.onsubmit = type === 'login' ? handleLogin : handleSignup;
    if (type === 'login') {
        document.getElementById('email').style.display = 'none';
        document.getElementById('name').style.display = 'none';
        document.getElementById('location').style.display = 'none';
        document.getElementById('dob').style.display = 'none';
        document.getElementById('terms').parentElement.style.display = 'none';
    } else {
        document.getElementById('email').style.display = 'block';
        document.getElementById('name').style.display = 'block';
        document.getElementById('location').style.display = 'block';
        document.getElementById('dob').style.display = 'block';
        document.getElementById('terms').parentElement.style.display = 'block';
    }
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('auth-message').textContent = '';
}

function handleLogin(e) {
    e.preventDefault();
    const loginId = document.getElementById('login-id').value;
    const password = document.getElementById('password').value;
    if (users[loginId] && users[loginId].password === password) {
        document.getElementById('auth-message').textContent = 'Login successful!';
        setTimeout(closeAuthModal, 1000);
    } else {
        document.getElementById('auth-message').textContent = 'Invalid credentials.';
    }
}

function handleSignup(e) {
    e.preventDefault();
    const loginId = document.getElementById('login-id').value;
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const location = document.getElementById('location').value;
    const dob = document.getElementById('dob').value;
    const password = document.getElementById('password').value;
    const terms = document.getElementById('terms').checked;

    if (!terms) {
        document.getElementById('auth-message').textContent = 'Please agree to the terms.';
        return;
    }
    if (!users[loginId]) {
        users[loginId] = { email, name, location, dob, password };
        localStorage.setItem('users', JSON.stringify(users));
        document.getElementById('auth-message').textContent = 'Signup successful! Please login.';
    } else {
        document.getElementById('auth-message').textContent = 'Login ID already exists.';
    }
}

function showForgotPassword() {
    const loginId = prompt('Enter your Login ID:');
    if (users[loginId]) {
        alert(`Your password is: ${users[loginId].password}`);
    } else {
        alert('Login ID not found.');
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
