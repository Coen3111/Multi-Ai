// script.js

// --- CONFIG ---
const GROQ_API_KEY = "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";
const REPLICATE_API_KEY = "YOUR_REPLICATE_API_KEY_HERE"; // <-- Replace with your Replicate token

// --- CHAT PAGE LOGIC ---
if (document.body.classList.contains("chat-page")) {
  const chatWindow = document.getElementById("chat-window");
  const chatForm = document.getElementById("chat-form");
  const userInput = document.getElementById("user-input");
  const typingIndicator = document.getElementById("typing-indicator");

  function createMessage(text, isAssistant = false) {
    const div = document.createElement("div");
    div.className = "message " + (isAssistant ? "assistant" : "user");
    // Detect code blocks and style them
    if (isAssistant && text.includes("```")) {
      // Extract code blocks
      let parts = text.split(/(```[\s\S]*?```)/g);
      parts.forEach(part => {
        if (part.startsWith("```")) {
          // Remove ``` and possible language hint
          const codeContent = part.replace(/```.*\n?/, "").replace(/```$/, "");
          const codeBlock = document.createElement("code");
          codeBlock.textContent = codeContent;

          // Wrapper div for code block + copy button
          const wrapper = document.createElement("div");
          wrapper.style.position = "relative";

          // Copy button
          const copyBtn = document.createElement("button");
          copyBtn.textContent = "Copy";
          copyBtn.className = "copy-btn";
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(codeContent).then(() => {
              copyBtn.textContent = "Copied!";
              setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
            });
          };

          wrapper.appendChild(codeBlock);
          wrapper.appendChild(copyBtn);
          div.appendChild(wrapper);
        } else {
          // Normal text part
          const p = document.createElement("p");
          p.textContent = part;
          div.appendChild(p);
        }
      });
    } else {
      div.textContent = text;
    }
    return div;
  }

  async function sendMessage(message) {
    // Show user message
    chatWindow.appendChild(createMessage(message, false));
    chatWindow.scrollTop = chatWindow.scrollHeight;
    userInput.value = "";

    // Show typing
    typingIndicator.classList.remove("hidden");

    // Call Groq API
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + GROQ_API_KEY,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [{ role: "user", content: message }],
        }),
      });

      const data = await response.json();
      const aiReply = data.choices?.[0]?.message?.content || "Sorry, no response.";

      typingIndicator.classList.add("hidden");
      chatWindow.appendChild(createMessage(aiReply, true));
      chatWindow.scrollTop = chatWindow.scrollHeight;
    } catch (e) {
      typingIndicator.classList.add("hidden");
      chatWindow.appendChild(createMessage("Error: " + e.message, true));
    }
  }

  chatForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;
    sendMessage(text);
  });
}

// --- IMAGE PAGE LOGIC ---
if (document.body.classList.contains("image-page")) {
  const imageForm = document.getElementById("image-form");
  const promptInput = document.getElementById("prompt");
  const imageUrlInput = document.getElementById("image-url");
  const resultContainer = document.getElementById("result-container");

  imageForm.addEventListener("submit", async e => {
    e.preventDefault();
    resultContainer.innerHTML = "Generating image...";
    try {
      const response = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + REPLICATE_API_KEY,
          "Content-Type": "application/json",
          "Prefer": "wait",
        },
        body: JSON.stringify({
          input: {
            prompt: promptInput.value,
            input_image: imageUrlInput.value,
            output_format: "jpg"
          }
        }),
      });

      const data = await response.json();
      if (data.output) {
        resultContainer.innerHTML = `<img src="${data.output}" alt="Generated Image" />`;
      } else {
        resultContainer.textContent = "Failed to generate image.";
      }
    } catch (err) {
      resultContainer.textContent = "Error: " + err.message;
    }
  });
}
