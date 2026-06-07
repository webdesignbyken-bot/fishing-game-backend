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
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful high school math teacher. Create clean, well-organized reference sheets with proper LaTeX using $$ for math."
          },
          {
            role: "user",
            content: `Create a clear, printable math reference sheet for: ${prompt}. Include key formulas, properties, and examples.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
      })
    });

    const data = await openaiResponse.json();
    const content = data.choices[0].message.content;

    res.status(200).json({ content: content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
}
