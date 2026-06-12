export const analyzeStock = async (ticker, apiKey, provider) => {
  const systemPrompt = `You are an elite stock market technical analyst specializing in the Nepal Stock Exchange (NEPSE).
Your task is to analyze the stock ticker provided and output a structured technical analysis report.
Since you don't have real-time live data feeds, base your analysis on general structural principles and typical price action patterns for this asset if you know it, or provide a highly plausible structural analysis template that the user can cross-reference with their live NepseAlpha chart.
Analyze using these frameworks, weighted by historical success rate:
- Primary: SMC (Smart Money Concepts), ICT Concepts, Wyckoff Method, Volume Profile / VWAP Analysis.
- Secondary: EMA/SMA, RSI Divergence, MACD, Fibonacci, Support/Resistance, Candlestick Patterns.

You MUST output exactly in the following format (replace brackets with your analysis):

📌 [TICKER] — [COMPANY NAME]
🔍 Current Price: [price] | Sector: [sector]

📐 Market Structure (SMC):
- Trend: [Bullish/Bearish/Ranging]
- Last CHoCH/MSS: [level]
- Active Order Block: [zone]
- FVG: [present/absent + range]
- Liquidity Target: [above/below]

📊 Wyckoff Phase: [Accumulation Phase X / Distribution / Markup]

📈 Key Levels:
- Strong Support: [price]
- Strong Resistance: [price]
- OTE Zone: [range]

🎯 Trade Bias: [LONG / SHORT / NEUTRAL]
⚠️ Invalidation: [price level]
📅 Timeframe: [best timeframe for this setup]

💡 Summary: [2-3 sentence plain-English take]
`;

  const userPrompt = `Please analyze the NEPSE stock: ${ticker}.`;

  try {
    let endpoint, headers, body, extractText;

    if (provider === 'Anthropic') {
      endpoint = 'https://api.anthropic.com/v1/messages';
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerously-allow-browser': 'true'
      };
      body = JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });
      extractText = (data) => data.content[0].text;
    } 
    else if (provider === 'Gemini') {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
      headers = { 'Content-Type': 'application/json' };
      body = JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }]
      });
      extractText = (data) => data.candidates[0].content.parts[0].text;
    }
    else if (provider === 'Grok') {
      endpoint = 'https://api.x.ai/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      body = JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });
      extractText = (data) => data.choices[0].message.content;
    }
    else if (provider === 'Kimi') {
      endpoint = 'https://api.moonshot.cn/v1/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      body = JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });
      extractText = (data) => data.choices[0].message.content;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error:', errorData);
      throw new Error(errorData?.error?.message || errorData?.message || `Failed to fetch from ${provider} API. CORS issue or invalid key.`);
    }

    const data = await response.json();
    return extractText(data);
  } catch (error) {
    console.error("Error analyzing stock:", error);
    throw error;
  }
};
