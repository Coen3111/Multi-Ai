// ====== Chat AI Logic ======

const chatApiKey = "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";
const chatModel = "llama-3.3-70b-versatile";

const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

if (userInput && sendBtn && chatContainer) {
  // Enable send button only if input has content
  userInput.addEventListener("input", () => {
    sendBtn.disabled = userInput.value.trim().length === 0;
  });

  sendBtn.addEventListener("click", async () => {
    const question = userInput.value.trim();
    if (!question) return;

    appendMessage(question, "user-msg");
    userInput.value = "";
    sendBtn.disabled = true;

    const typingMessage = appendTyping();

    try {
      const aiResponse = await sendToGroqAPI(question);
      removeTyping(typingMessage);
      appendMessage(formatResponse(aiResponse), "ai-msg");
      chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (err) {
      removeTyping(typingMessage);
      appendMessage("Error: " + err.message, "ai-msg");
    }
  });

  // Append user or AI message
  function appendMessage(text, className) {
    const div = document.createElement("div");
    div.className = "message " + className;
    if (className === "ai-msg") {
      div.innerHTML = parseMarkdown(text);
    } else {
      div.textContent = text;
    }
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return div;
  }

  // Append typing indicator
  function appendTyping() {
    const div = document.createElement("div");
    div.className = "message ai-msg";
    div.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return div;
  }

  // Remove typing indicator
  function removeTyping(typingNode) {
    typingNode?.remove();
  }

  // Send question to Groq API
  async function sendToGroqAPI(question) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chatApiKey}`,
      },
      body: JSON.stringify({
        model: chatModel,
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "No response";
  }

  // Parse markdown-like code blocks
  function parseMarkdown(text) {
    const codeBlockRegex = /```([\s\S]+?)```/g;

    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    let formatted = text.replace(codeBlockRegex, (_, code) => {
      const escapedCode = escapeHtml(code.trim());
      return `
        <pre>
          <button class="copy-btn" onclick="copyCode(this)">Copy</button>
          ${escapedCode}
        </pre>
      `;
    });

    // Escape other HTML chars outside pre tags
    formatted = formatted.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // Revert escaping inside <pre> blocks & buttons
    formatted = formatted.replace(/&lt;pre&gt;/g, "<pre>").replace(/&lt;\/pre&gt;/g, "</pre>");
    formatted = formatted.replace(/&lt;button/g, "<button").replace(/button&gt;/g, "button>");

    return formatted;
  }

  // Copy code button handler
  window.copyCode = function (button) {
    const code = button.nextSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
      button.textContent = "Copied!";
      setTimeout(() => (button.textContent = "Copy"), 1500);
    });
  };

  userInput.focus();

  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !sendBtn.disabled) {
      sendBtn.click();
    }
  });
}

// ====== Image Generator Logic ======

const imageApiKey = "sk-6Z6ShyGx2P9rPz5grcK4ynz9jchpYm2BfTbo8rSCOgKEHoBP";

const promptInput = document.getElementById("image-prompt");
const generateBtn = document.getElementById("generate-btn");
const outputDiv = document.getElementById("image-output");

if (promptInput && generateBtn && outputDiv) {
  promptInput.addEventListener("input", () => {
    generateBtn.disabled = promptInput.value.trim().length === 0;
  });

  generateBtn.addEventListener("click", async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    generateBtn.disabled = true;
    outputDiv.innerHTML = `<p style="color:#0f62fe;">Generating image, please wait...</p>`;

    try {
      // Fake delay & sample image for testing only:
      await new Promise((r) => setTimeout(r, 2000));
      // Normally you would do a fetch POST to your backend for the image generation here
      // For example:
      // const res = await fetch("YOUR_BACKEND_API_HERE", { ... });

      // For demo: show a placeholder image from Unsplash
      outputDiv.innerHTML = `
        <img src="https://source.unsplash.com/600x400/?${encodeURIComponent(prompt)}" alt="Generated image" />
      `;
    } catch (err) {
      outputDiv.innerHTML = `<p style="color:red;">Error generating image: ${err.message}</p>`;
    } finally {
      generateBtn.disabled = false;
    }
  });
}
