const apiKey = "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";
const model = "llama-3.3-70b-versatile";

document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat-container");
  const imageOutput = document.getElementById("image-output");
  const userInput = document.getElementById("user-input");
  const imagePrompt = document.getElementById("image-prompt");
  const inputArea = document.getElementById("input-area");
  const sendBtn = document.getElementById("send-btn");
  const generateBtn = document.getElementById("generate-btn");

  if (chatContainer && userInput && sendBtn) {
    // Chat page logic
    inputArea.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = userInput.value.trim();
      if (!message) return;

      appendMessage(message, "user-msg");
      userInput.value = "";
      sendBtn.disabled = true;

      appendTypingIndicator();

      try {
        const aiResponse = await fetchAIResponse(message);
        removeTypingIndicator();
        appendMessage(aiResponse, "ai-msg");
      } catch (err) {
        removeTypingIndicator();
        appendMessage("Error: Could not get response.", "ai-msg");
      } finally {
        sendBtn.disabled = false;
        scrollToBottom(chatContainer);
      }
    });

  } else if (imageOutput && imagePrompt && generateBtn) {
    // Image page logic
    inputArea.addEventListener("submit", async (e) => {
      e.preventDefault();
      const prompt = imagePrompt.value.trim();
      if (!prompt) return;

      imagePrompt.value = "";
      generateBtn.disabled = true;
      imageOutput.innerHTML = `<p style="color:#ccc;">Generating image, please wait...</p>`;

      try {
        const imageUrl = await fetchImage(prompt);
        imageOutput.innerHTML = `<img src="${imageUrl}" alt="Generated image" />`;
      } catch (err) {
        imageOutput.innerHTML = `<p style="color:red;">Error generating image.</p>`;
      } finally {
        generateBtn.disabled = false;
      }
    });
  }

  function appendMessage(text, className) {
    const div = document.createElement("div");
    div.className = `message ${className}`;

    // Detect if text contains code block markdown
    if (/```/.test(text)) {
      const codeBlockMatch = text.match(/```(\w+)?\n([\s\S]*?)```/);
      if (codeBlockMatch) {
        const lang = codeBlockMatch[1] || "";
        const code = codeBlockMatch[2];

        const before = text.substring(0, codeBlockMatch.index).trim();
        const after = text.substring(codeBlockMatch.index + codeBlockMatch[0].length).trim();

        if (before) {
          const pBefore = document.createElement("p");
          pBefore.textContent = before;
          div.appendChild(pBefore);
        }

        const pre = document.createElement("pre");
        const codeEl = document.createElement("code");
        codeEl.textContent = code;
        pre.appendChild(codeEl);

        // Copy button
        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "Copy";
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(code).then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
          });
        };
        pre.appendChild(copyBtn);

        div.appendChild(pre);

        if (after) {
          const pAfter = document.createElement("p");
          pAfter.textContent = after;
          div.appendChild(pAfter);
        }
      } else {
        div.textContent = text;
      }
    } else {
      div.textContent = text;
    }

    if (chatContainer) {
      chatContainer.appendChild(div);
      scrollToBottom(chatContainer);
    }
  }

  function appendTypingIndicator() {
    if (!chatContainer) return;
    const typingDiv = document.createElement("div");
    typingDiv.className = "message ai-msg typing";
    typingDiv.id = "typing-indicator";

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("span");
      typingDiv.appendChild(dot);
    }
    chatContainer.appendChild(typingDiv);
    scrollToBottom(chatContainer);
  }

  function removeTypingIndicator() {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
  }

  function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }

  async function fetchAIResponse(message) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "user", content: message }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error("API error");
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response";
  }

  async function fetchImage(prompt) {
    // Placeholder: just return a random Unsplash image based on prompt
    return `https://source.unsplash.com/600x400/?${encodeURIComponent(prompt)}`;
  }
});
