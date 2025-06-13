// Chat Logic
async function sendChat() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML += `<div><strong>You:</strong> ${message}</div>`;
  input.value = '';

  chatBox.innerHTML += `<div class=\"typing\">AI is typing...</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: message }]
    })
  });

  const data = await response.json();
  document.querySelector('.typing')?.remove();
  const reply = data.choices?.[0]?.message?.content || 'Error getting reply.';
  chatBox.innerHTML += `<div><strong>AI:</strong> ${reply}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Image Generator Logic
async function generateImage() {
  const prompt = document.getElementById('prompt').value;
  const output = document.getElementById('image-output');
  output.innerHTML = 'Generating...';

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk-6Z6ShyGx2P9rPz5grcK4ynz9jchpYm2BfTbo8rSCOgKEHoBP',
      'Accept': 'image/*'
    },
    body: new URLSearchParams({
      prompt,
      output_format: 'jpeg'
    })
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  output.innerHTML = `<img src=\"${url}\" alt=\"Generated Image\" />`;
}
