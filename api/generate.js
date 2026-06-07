export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: "grok-beta",   // or "grok-3" if available
        messages: [
          {
            role: "system",
            content: "You are an expert high school math teacher. Create clean, well-organized, printable reference sheets. Use $$ for display math and **bold** for headings."
          },
          {
            role: "user",
            content: `Create a clear, professional math reference sheet for: ${prompt}. Include key formulas, properties, and examples in proper LaTeX.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1400
      })
    });

    const data = await grokResponse.json();
    const content = data.choices[0].message.content;

    res.status(200).json({ content: content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate sheet' });
  }
}
