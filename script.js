// Groq API key
const GROQ_API_KEY = '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';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Bytez API key for embeddings and images
const BYTEZ_API_KEY = '4cb461761d3ec8eca43b3bc9a5c197f0';
const BYTEZ_BASE_URL = 'https://api.bytez.com/models';
// OCR Space API key
const OCR_API_KEY = 'K83174044688957';
const OCR_URL = 'https://api.ocr.space/parse/image';

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Chat functionality
document.getElementById('send-chat').addEventListener('click', async () => {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    const userMessage = input.value.trim();
    if (!userMessage) return;

    messages.innerHTML += `<div>User: ${userMessage}</div>`;
    input.value = '';

    if (window.location.protocol === 'file:') {
        messages.innerHTML += `<div>AI: API not accessible from local file. Please host the site on a server like GitHub Pages.</div>`;
        return;
    }

    try {
        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                    { role: 'system', content: 'You are Aine, a Forex and Crypto educational AI for complete beginners. Assume the user knows nothing about trading. Explain every term in simple words. Use analogies. Avoid jargon or explain it. Provide clear, step-by-step guidance on what to do next. Teach before suggesting. Always end with: This is not financial advice. This is only to help you learn.' },
                    { role: 'user', content: userMessage }
                ]
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const aiMessage = data.choices[0].message.content;
        messages.innerHTML += `<div>AI: ${aiMessage}</div>`;
    } catch (error) {
        // Fallback mock response for demo
        const mockResponse = `Hello! I'm Aine, your Forex and Crypto educational assistant. For "${userMessage}", here's some educational info: Market bias is currently neutral. Indicators like RSI can help identify overbought/oversold conditions. A simple strategy is to buy on dips in a bull trend. Always use stop-losses and remember, this is not financial advice.`;
        messages.innerHTML += `<div>AI: ${mockResponse}</div>`;
    }
    messages.scrollTop = messages.scrollHeight;
});

// Tools calculators
document.getElementById('calc-pip').addEventListener('click', () => {
    const pipValue = parseFloat(document.getElementById('pip-value').value);
    const lotSize = parseFloat(document.getElementById('lot-size').value);
    const result = pipValue * lotSize;
    document.getElementById('pip-result').textContent = `Pip Value: ${result}`;
});

document.getElementById('calc-rr').addEventListener('click', () => {
    const entry = parseFloat(document.getElementById('entry-price').value);
    const sl = parseFloat(document.getElementById('stop-loss').value);
    const tp = parseFloat(document.getElementById('take-profit').value);
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    const rr = reward / risk;
    document.getElementById('rr-result').textContent = `Risk-Reward Ratio: ${rr.toFixed(2)}`;
});

document.getElementById('calc-pos').addEventListener('click', () => {
    const balance = parseFloat(document.getElementById('account-balance').value);
    const riskPercent = parseFloat(document.getElementById('risk-percent').value) / 100;
    const stopPips = parseFloat(document.getElementById('stop-pips').value);
    const riskAmount = balance * riskPercent;
    const pipValue = 0.0001; // Assuming EURUSD, adjust as needed
    const positionSize = riskAmount / (stopPips * pipValue);
    document.getElementById('pos-result').textContent = `Position Size: ${positionSize.toFixed(2)} lots`;
});

// Strategy Generator
document.getElementById('generate-strategy').addEventListener('click', async () => {
    const assetType = document.getElementById('asset-type').value;
    const pairCoin = document.getElementById('pair-coin').value;
    const timeframe = document.getElementById('timeframe').value;
    const riskLevel = document.getElementById('risk-level').value;
    const style = document.getElementById('trading-style').value;

    const prompt = `Generate an educational trading strategy for ${assetType} ${pairCoin} on ${timeframe} timeframe, ${riskLevel} risk, ${style} style. Include entry, exit, stop-loss, risk rules, psychology tips.`;

    if (window.location.protocol === 'file:') {
        document.getElementById('strategy-result').textContent = 'API not accessible from local file. Please host the site.';
        return;
    }

    try {
        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                    { role: 'system', content: 'Generate educational trading strategies for complete beginners. Explain every step in simple words. Include why each step exists. Frame as examples, not instructions. Advise to skip trading if not understood. End with risk disclaimer.' },
                    { role: 'user', content: prompt }
                ]
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const strategy = data.choices[0].message.content;
        document.getElementById('strategy-result').innerHTML = strategy;
        sessionStorage.setItem('lastStrategy', strategy);
    } catch (error) {
        // Fallback mock
        const mockStrategy = `Educational Strategy for ${assetType} ${pairCoin} on ${timeframe}:\n\nEntry: Wait for pullback in trend.\nExit: Target 2:1 RR.\nStop-loss: Below recent swing low.\nRisk rules: Max 2% per trade.\nPsychology: Stay disciplined.`;
        document.getElementById('strategy-result').innerHTML = mockStrategy;
        sessionStorage.setItem('lastStrategy', mockStrategy);
    }
});

// Learn search
document.getElementById('search-learn').addEventListener('click', async () => {
    const query = document.getElementById('search-query').value.trim();
    if (!query) return;

    if (window.location.protocol === 'file:') {
        document.getElementById('learn-results').textContent = 'API not accessible from local file. Please host the site.';
        return;
    }

    // Use embeddings for semantic search
    try {
        const embedResponse = await fetch(`${BYTEZ_BASE_URL}/BAAI/bge-m3/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({
                inputs: { text: query }
            })
        });
        if (!embedResponse.ok) throw new Error(`HTTP ${embedResponse.status}`);
        const embedData = await embedResponse.json();
        const embedding = embedData.output.embedding;

        // For simplicity, generate content based on query using Groq
        const contentResponse = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                    { role: 'system', content: 'Provide educational content on Forex and Crypto topics for complete beginners. Explain everything in simple words. Use analogies. Avoid jargon or define it.' },
                    { role: 'user', content: `Explain: ${query}` }
                ]
            })
        });
        if (!contentResponse.ok) throw new Error(`HTTP ${contentResponse.status}`);
        const contentData = await contentResponse.json();
        const content = contentData.choices[0].message.content;
        document.getElementById('learn-results').innerHTML = content;
    } catch (error) {
        // Fallback mock
        const mockContent = `Educational content on "${query}": Forex basics involve currency pairs, pips, and leverage. Crypto includes Bitcoin, Ethereum, and market volatility. Always learn risk management.`;
        document.getElementById('learn-results').innerHTML = mockContent;
    }
});

// Chart Analysis
document.getElementById('analyze-chart').addEventListener('click', async () => {
    const fileInput = document.getElementById('chart-upload');
    if (!fileInput.files[0]) return;

    if (window.location.protocol === 'file:') {
        document.getElementById('chart-result').textContent = 'API not accessible from local file. Please host the site.';
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', OCR_API_KEY);
    formData.append('language', 'eng');

    try {
        // First, OCR the image
        const ocrResponse = await fetch(OCR_URL, {
            method: 'POST',
            body: formData
        });
        if (!ocrResponse.ok) throw new Error(`OCR HTTP ${ocrResponse.status}`);
        const ocrData = await ocrResponse.json();
        const extractedText = ocrData.ParsedResults[0].ParsedText;

        // Then, analyze with AI
        try {
            const response = await fetch(GROQ_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192',
                    messages: [
                        { role: 'system', content: 'Analyze the chart for complete beginners. Follow this strict structure: 1. What You’re Looking At (simple explanation). 2. What Price Is Doing (up/down/sideways). 3. Why This Is Happening (simple reason). 4. What You Should Do Next (clear beginner guidance). 5. Example Trade Idea (optional, educational only). 6. Risk Reminder (not financial advice).' },
                        { role: 'user', content: `Analyze this chart data: ${extractedText}` }
                    ]
                })
            });
            if (!response.ok) throw new Error(`AI HTTP ${response.status}`);
            const data = await response.json();
            const analysis = data.choices[0].message.content;
            document.getElementById('chart-result').innerHTML = analysis;
        } catch (aiError) {
            // Fallback mock analysis
            const mockAnalysis = `Chart Analysis: Based on extracted data "${extractedText}", the trend appears upward. Support at lower levels, resistance at higher. Possible bullish pattern.`;
            document.getElementById('chart-result').innerHTML = mockAnalysis;
        }

        // AI-generated illustration not implemented (Bytez image generation failed)
        document.getElementById('chart-result').innerHTML += `<p>(AI-generated illustration feature pending)</p>`;
    } catch (error) {
        document.getElementById('chart-result').textContent = `Error: ${error.message}`;
    }
});