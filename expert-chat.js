// ===== Expert Chat Functionality =====

// OpenAI API Configuration
const OPENAI_API_KEY = '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';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Expert data
const experts = {
    dr_sharma: {
        name: 'Dr. Rajesh Sharma',
        avatar: '👨‍🌾',
        specialty: 'Organic Farming Specialist',
        responses: [
            "Hello! I'm Dr. Rajesh Sharma. How can I help you with organic farming today?",
            "That's a great question! For organic farming, I recommend starting with soil testing.",
            "Composting is key. Use kitchen waste, crop residue, and cow dung for best results.",
            "Crop rotation helps prevent soil depletion. Try alternating between legumes and cereals.",
            "Avoid chemical pesticides. Neem oil and garlic spray work great for pest control!",
            "For organic certification, contact your local agricultural office. It takes 2-3 years.",
            "Yes, organic farming is more profitable in the long term despite lower initial yields."
        ]
    },
    dr_patel: {
        name: 'Dr. Priya Patel',
        avatar: '👩‍🌾',
        specialty: 'Soil Science Expert',
        responses: [
            "Hi! I'm Dr. Priya Patel, soil science specialist. What would you like to know?",
            "Soil pH is crucial! Most crops prefer pH 6.0-7.0. Get a soil test done first.",
            "Add vermicompost to improve soil structure. It increases water retention by 40%!",
            "Green manure crops like dhaincha and sunhemp enrich soil with nitrogen naturally.",
            "Micronutrients matter! Apply zinc and boron based on soil test results.",
            "Avoid over-tilling. It destroys soil structure and beneficial microorganisms.",
            "Bio-fertilizers like Rhizobium and Azotobacter boost soil fertility organically."
        ]
    },
    prof_kumar: {
        name: 'Prof. Amit Kumar',
        avatar: '👨‍🔬',
        specialty: 'Crop Management',
        responses: [
            "Namaste! Professor Amit Kumar here. How can I assist with your crops?",
            "Intercropping increases yield by 20-30%. Try maize with beans or wheat with mustard.",
            "Drip irrigation saves 60% water compared to flood irrigation. Very cost-effective!",
            "Mulching reduces water evaporation and controls weeds. Use crop residue or plastic sheets.",
            "For better yields, maintain proper plant spacing. Overcrowding reduces productivity.",
            "Weather-based advisories are crucial. Check IMD forecasts before sowing.",
            "Harvest at the right time! Premature or late harvest reduces crop quality significantly."
        ]
    },
    dr_singh: {
        name: 'Dr. Vikram Singh',
        avatar: '👨‍⚕️',
        specialty: 'Pest Control Specialist',
        responses: [
            "Hello! Dr. Vikram Singh here. Tell me about your pest problem.",
            "For aphids, spray neem oil solution (5ml/liter water) early morning.",
            "Yellow sticky traps work excellent for whiteflies. Place 8-10 traps per acre.",
            "Pheromone traps attract and capture moths. Very effective for tomato fruit borers.",
            "Bacillus thuringiensis (Bt) is an organic pesticide safe for beneficial insects.",
            "Companion planting helps! Marigold repels many pests naturally.",
            "IPM (Integrated Pest Management) combines multiple methods for best results."
        ]
    }
};

let currentExpert = null;
let messageCount = 0;

// Toggle expert panel
function toggleExpertChat() {
    const panel = document.getElementById('expertPanel');
    const chatWindow = document.getElementById('chatWindow');
    const floatBtn = document.getElementById('chatFloatBtn');

    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        chatWindow.style.display = 'none';
        floatBtn.style.display = 'none';
    } else {
        panel.style.display = 'none';
        floatBtn.style.display = 'flex';
    }
}

// Close expert panel
function closeExpertPanel() {
    document.getElementById('expertPanel').style.display = 'none';
    document.getElementById('chatFloatBtn').style.display = 'flex';
}

// Start chat with expert
function startChat(expertId) {
    currentExpert = experts[expertId];
    messageCount = 0;
    conversationHistory = []; // Reset conversation history

    // Update chat header
    document.getElementById('chatExpertAvatar').textContent = currentExpert.avatar;
    document.getElementById('chatExpertName').textContent = currentExpert.name;
    document.getElementById('chatExpertStatus').textContent = 'Online';

    // Clear messages
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';

    // Hide panel, show chat window
    document.getElementById('expertPanel').style.display = 'none';
    document.getElementById('chatWindow').style.display = 'flex';

    // Send initial welcome message
    setTimeout(() => {
        addExpertMessage(currentExpert.responses[0]);
    }, 500);
}

// Close chat
function closeChat() {
    document.getElementById('chatWindow').style.display = 'none';
    document.getElementById('chatFloatBtn').style.display = 'flex';
    currentExpert = null;
}

// Minimize chat
function minimizeChat() {
    document.getElementById('chatWindow').style.display = 'none';
    document.getElementById('expertPanel').style.display = 'block';
}

// Chat conversation history
let conversationHistory = [];

// Send message with ChatGPT API
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message || !currentExpert) return;

    // Add user message
    addUserMessage(message);
    input.value = '';

    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });

    // Show typing indicator
    showTypingIndicator();

    try {
        // Call OpenAI API
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are ${currentExpert.name}, a ${currentExpert.specialty} specializing in agricultural advice. Provide helpful, practical advice to farmers in a friendly and professional manner. Keep responses concise (2-3 sentences) and actionable. Use your expertise in ${currentExpert.specialty.toLowerCase()} to give specific recommendations.`
                    },
                    ...conversationHistory
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        const data = await response.json();

        removeTypingIndicator();

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const expertResponse = data.choices[0].message.content;

            // Add to conversation history
            conversationHistory.push({
                role: 'assistant',
                content: expertResponse
            });

            addExpertMessage(expertResponse);
        } else {
            throw new Error('Invalid response from API');
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        removeTypingIndicator();

        // Fallback to pre-defined responses
        messageCount++;
        const responseIndex = Math.min(messageCount, currentExpert.responses.length - 1);
        addExpertMessage(currentExpert.responses[responseIndex]);
    }
}

// Handle enter key in chat input
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add user message
function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const messageHTML = `
        <div class="message user">
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${text}</p>
                <div class="message-time">${time}</div>
            </div>
        </div>
    `;

    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    scrollToBottom();
}

// Add expert message
function addExpertMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const messageHTML = `
        <div class="message expert">
            <div class="message-avatar">${currentExpert.avatar}</div>
            <div class="message-content">
                <p>${text}</p>
                <div class="message-time">${time}</div>
            </div>
        </div>
    `;

    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');

    const typingHTML = `
        <div class="typing-indicator" id="typingIndicator">
            <div class="message-avatar">${currentExpert.avatar}</div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;

    messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Auto-open chat hint (optional - shows after 5 seconds)
setTimeout(() => {
    const floatBtn = document.getElementById('chatFloatBtn');
    if (floatBtn && floatBtn.style.display !== 'none') {
        floatBtn.style.animation = 'floatPulse 0.5s ease 3';
    }
}, 5000);

console.log('💬 Expert Chat initialized! Click the floating button to chat with agricultural experts.');
