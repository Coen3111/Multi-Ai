// multi-ai.js

const chatApiKey = "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";
const chatApiUrl = "https://api.groq.com/openai/v1/chat/completions";

const stabilityApiKey = "sk-6Z6ShyGx2P9rPz5grcK4ynz9jchpYm2BfTbo8rSCOgKEHoBP";
const stabilityApiUrl = "https://api.stability.ai/v2beta/stable-image/generate/sd3";

// --- Chat page code ---
async function sendChatMessage(message) {
  const payload = {
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "user", content: message }
    ]
  };

  try {
    const response = await fetch(chatApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chatApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    // Assuming the completion text is here:
    return data.choices?.[0]?.message?.content || "No response";
  } catch (err) {
    console.error("Chat API error:", err);
    return `Error: ${err.message}`;
  }
}

// Helper: Wrap code blocks in styled box with copy button for chat messages containing code
function formatChatResponse(text) {
  // Basic simple markdown code block regex for ``` blocks
  const codeBlockRegex = /```([\s\S]*?)```/g;

  // Replace code blocks with styled HTML + copy button
  let formatted = text.replace(codeBlockRegex, (match, code) => {
    const escapedCode = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `
      <div class="code-block">
        <pre><code>${escapedCode}</code></pre>
        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
      </div>
    `;
  });

  // Replace newlines with <br> for normal text lines outside code blocks
  formatted = formatted.replace(/\n/g, "<br>");
  return formatted;
}

// Copy code button handler
function copyCode(button) {
  const code = button.previousElementSibling.textContent;
  navigator.clipboard.writeText(code).then(() => {
    button.textContent = "Copied!";
    setTimeout(() => (button.textContent = "Copy"), 1500);
  });
}

// --- Image generation page code ---
async function generateImageStability(prompt) {
  const payload = {
    prompt,
    output_format: "jpeg",
  };

  function createFormData(obj) {
    const formData = new FormData();
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        formData.append(key, JSON.stringify(obj[key]));
      } else {
        formData.append(key, obj[key]);
      }
    }
    return formData;
  }

  try {
    const response = await fetch(stabilityApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stabilityApiKey}`,
        Accept: "image/*",
      },
      body: createFormData(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error("Stability AI error:", err);
    throw err;
  }
}

// --- UI helpers ---

// Show typing bubbles in chat while waiting for response
function showTypingBubbles(container) {
  const bubble = document.createElement("div");
  bubble.className = "typing-bubbles";
  bubble.innerHTML = `<span></span><span></span><span></span>`;
  container.appendChild(bubble);
  return bubble;
}

function removeTypingBubbles(bubble) {
  bubble?.remove();
}

// --- Exported functions for your HTML ---

// For chat page: handle send button click
async function handleSendChat() {
  const input = document.getElementById("chat-input");
  const messagesContainer = document.getElementById("chat-messages");
  const message = input.value.trim();
  if (!message) return;

  // Add user message to chat
  const userMsgEl = document.createElement("div");
  userMsgEl.className = "chat-message user";
  userMsgEl.textContent = message;
  messagesContainer.appendChild(userMsgEl);

  input.value = "";
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Show typing bubbles
  const typing = showTypingBubbles(messagesContainer);

  // Get AI response
  const response = await sendChatMessage(message);

  // Remove typing bubbles
  removeTypingBubbles(typing);

  // Format response with code blocks
  const formatted = formatChatResponse(response);

  // Add AI message
  const aiMsgEl = document.createElement("div");
  aiMsgEl.className = "chat-message ai";
  aiMsgEl.innerHTML = formatted;
  messagesContainer.appendChild(aiMsgEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// For image page: handle generate button click
async function handleGenerateImage() {
  const promptInput = document.getElementById("image-prompt");
  const loadingText = document.getElementById("loading");
  const outputImg = document.getElementById("output-image");
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert("Please enter a prompt.");
    return;
  }

  loadingText.style.display = "block";
  outputImg.style.display = "none";

  try {
    const imageUrl = await generateImageStability(prompt);
    outputImg.src = imageUrl;
    outputImg.style.display = "block";
  } catch (err) {
    alert("Error generating image: " + err.message);
  } finally {
    loadingText.style.display = "none";
  }
}
