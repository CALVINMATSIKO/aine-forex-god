// Bytez API key
const API_KEY = '4cb461761d3ec8eca43b3bc9a5c197f0';
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
        const response = await fetch(`${BYTEZ_BASE_URL}/Qwen/Qwen2.5-0.5B/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                inputs: {
                    messages: [
                        { role: 'system', content: 'You are Aine, a Forex and Crypto educational AI. Provide educational responses only. Always include market bias, indicator explanation, strategy idea, and risk disclaimer.' },
                        { role: 'user', content: userMessage }
                    ]
                }
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const aiMessage = data.choices ? data.choices[0].message.content : data.output.choices[0].message.content;
        messages.innerHTML += `<div>AI: ${aiMessage}</div>`;
    } catch (error) {
        messages.innerHTML += `<div>Error: ${error.message}</div>`;
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
        const response = await fetch(`${BYTEZ_BASE_URL}/Qwen/Qwen2.5-0.5B/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({
                inputs: {
                    messages: [
                        { role: 'system', content: 'Generate educational trading strategies only.' },
                        { role: 'user', content: prompt }
                    ]
                }
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const strategy = data.output.choices[0].message.content;
        document.getElementById('strategy-result').innerHTML = strategy;
        sessionStorage.setItem('lastStrategy', strategy);
    } catch (error) {
        document.getElementById('strategy-result').textContent = `Error: ${error.message}`;
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

        // For simplicity, generate content based on query using Qwen
        const contentResponse = await fetch(`${BYTEZ_BASE_URL}/Qwen/Qwen2.5-0.5B/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                inputs: {
                    messages: [
                        { role: 'system', content: 'Provide educational content on Forex and Crypto topics.' },
                        { role: 'user', content: `Explain: ${query}` }
                    ]
                }
            })
        });
        if (!contentResponse.ok) throw new Error(`HTTP ${contentResponse.status}`);
        const contentData = await contentResponse.json();
        const content = contentData.output.choices[0].message.content;
        document.getElementById('learn-results').innerHTML = content;
    } catch (error) {
        document.getElementById('learn-results').textContent = `Error: ${error.message}`;
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
        const response = await fetch(`${BYTEZ_BASE_URL}/google/gemma-2-2b-it/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                inputs: {
                    messages: [
                        { role: 'system', content: 'Analyze the chart based on extracted text for trend direction, support & resistance, chart patterns, market structure. Provide educational text-based explanation.' },
                        { role: 'user', content: `Analyze this chart data: ${extractedText}` }
                    ]
                }
            })
        });
        if (!response.ok) throw new Error(`AI HTTP ${response.status}`);
        const data = await response.json();
        const analysis = data.output.choices[0].message.content;
        document.getElementById('chart-result').innerHTML = analysis;

        // Generate illustrative image
        const imageResponse = await fetch(`${BYTEZ_BASE_URL}/stabilityai/stable-diffusion-xl-base-1.0/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                inputs: {
                    prompt: `Educational illustration of a Forex chart showing ${analysis}. AI-generated.`,
                    negative_prompt: 'realistic, photo'
                }
            })
        });
        if (!imageResponse.ok) throw new Error(`Image HTTP ${imageResponse.status}`);
        const imageData = await imageResponse.json();
        const imageUrl = imageData.output.images[0]; // Assuming base64
        document.getElementById('chart-result').innerHTML += `<img src="data:image/png;base64,${imageUrl}" alt="AI-generated illustration" style="max-width:100%;">`;
    } catch (error) {
        document.getElementById('chart-result').textContent = `Error: ${error.message}`;
    }
});