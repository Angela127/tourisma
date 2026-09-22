import './decisionEngine.css';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export class DecisionEngineChatbot {
  public readonly element: HTMLElement;
  private isOpen: boolean = false;
  private isLoading: boolean = false;
  private messages: ChatMessage[] = [];
  private drawerElement!: HTMLElement;
  private messagesContainer!: HTMLElement;
  private inputElement!: HTMLTextAreaElement;
  private sendButton!: HTMLButtonElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'hc-decision-engine-root';
    this.render();
  }

  private render(): void {
    this.element.innerHTML = '';

    // 1. Floating Action Button (FAB) at Bottom-Right
    const fabWrap = document.createElement('div');
    fabWrap.className = 'hc-chat-fab-wrap';

    const fabBtn = document.createElement('button');
    fabBtn.type = 'button';
    fabBtn.className = 'hc-chat-fab';
    fabBtn.setAttribute('aria-label', 'Open Compass AI Copilot');
    fabBtn.title = 'Compass • Tourisma Spatial Copilot';
    fabBtn.innerHTML = `
      <img src="/robot-avatar.png" alt="Compass Robot" class="hc-fab-avatar-img" />
    `;

    fabBtn.addEventListener('click', () => this.toggleChat());
    fabWrap.appendChild(fabBtn);

    // 2. Chat Window Drawer
    this.drawerElement = document.createElement('div');
    this.drawerElement.className = 'hc-chat-drawer closed';

    // Header
    const header = document.createElement('div');
    header.className = 'hc-chat-header';
    header.innerHTML = `
      <div class="hc-chat-header-left">
        <div class="hc-chat-avatar">
          <img src="/robot-avatar.png" alt="Compass Robot" class="hc-chat-avatar-img" />
        </div>
        <div class="hc-chat-header-title-wrap">
          <h4 class="hc-chat-header-title">Compass</h4>
          <span class="hc-chat-header-sub">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #34d399; display: inline-block;"></span>
            Tourisma Spatial Copilot
          </span>
        </div>
      </div>
      <div class="hc-chat-header-actions">
        <button type="button" class="hc-chat-icon-btn" id="hc-chat-clear" title="Clear Conversation">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
        <button type="button" class="hc-chat-icon-btn" id="hc-chat-close" title="Minimize Window">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    header.querySelector('#hc-chat-close')?.addEventListener('click', () => this.toggleChat(false));
    header.querySelector('#hc-chat-clear')?.addEventListener('click', () => this.clearChat());

    // Messages Container
    this.messagesContainer = document.createElement('div');
    this.messagesContainer.className = 'hc-chat-body';
    this.renderWelcome();

    // Footer & Input
    const footer = document.createElement('div');
    footer.className = 'hc-chat-footer';

    const inputRow = document.createElement('div');
    inputRow.className = 'hc-chat-input-row';

    this.inputElement = document.createElement('textarea');
    this.inputElement.className = 'hc-chat-textarea';
    this.inputElement.placeholder = 'Ask a question or request a destination diagnosis...';
    this.inputElement.rows = 1;

    this.inputElement.addEventListener('input', () => {
      this.inputElement.style.height = 'auto';
      this.inputElement.style.height = `${Math.min(this.inputElement.scrollHeight, 90)}px`;
    });

    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.sendButton = document.createElement('button');
    this.sendButton.type = 'button';
    this.sendButton.className = 'hc-chat-send-btn';
    this.sendButton.title = 'Send query to Decision Engine';
    this.sendButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    `;
    this.sendButton.addEventListener('click', () => this.sendMessage());

    inputRow.appendChild(this.inputElement);
    inputRow.appendChild(this.sendButton);

    const disclaimer = document.createElement('span');
    disclaimer.className = 'hc-chat-disclaimer';
    disclaimer.textContent = 'Decisions synthesized with Tourisma spatial indicators.';

    footer.appendChild(inputRow);
    footer.appendChild(disclaimer);

    this.drawerElement.appendChild(header);
    this.drawerElement.appendChild(this.messagesContainer);
    this.drawerElement.appendChild(footer);

    this.element.appendChild(fabWrap);
    this.element.appendChild(this.drawerElement);
  }

  public toggleChat(forceState?: boolean): void {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    if (this.isOpen) {
      this.drawerElement.classList.remove('closed');
      setTimeout(() => this.inputElement.focus(), 150);
    } else {
      this.drawerElement.classList.add('closed');
    }
  }

  private clearChat(): void {
    this.messages = [];
    this.messagesContainer.innerHTML = '';
    this.renderWelcome();
  }

  private renderWelcome(): void {
    const welcomeWrap = document.createElement('div');
    welcomeWrap.className = 'hc-welcome-wrap';

    // 4-Step Decision Framework Card
    const frameworkBox = document.createElement('div');
    frameworkBox.className = 'hc-framework-banner';
    frameworkBox.innerHTML = `
      <div class="hc-welcome-header">
        <div class="hc-welcome-avatar-wrap">
          <img src="/robot-avatar.png" alt="Compass Robot" class="hc-welcome-avatar-img" />
        </div>
        <div class="hc-framework-intro">
          <strong>Hi, I am Compass!</strong>
          <p style="margin: 4px 0 0 0;">Ask about any Malaysian state, destination hotspot, or sector. Insights are synthesized using the 4-tier Strategic Protocol:</p>
        </div>
      </div>
      <div class="hc-framework-steps">
        <div class="hc-step-chip blue">
          <span class="hc-step-chip-num">1</span>
          <div>
            <span class="hc-step-chip-text">Tourism Diagnosis</span>
            <span class="hc-step-chip-sub"> — "What is happening?"</span>
          </div>
        </div>
        <div class="hc-step-chip amber">
          <span class="hc-step-chip-num">2</span>
          <div>
            <span class="hc-step-chip-text">Key Pressure Areas</span>
            <span class="hc-step-chip-sub"> — "Where is the problem?"</span>
          </div>
        </div>
        <div class="hc-step-chip indigo">
          <span class="hc-step-chip-num">3</span>
          <div>
            <span class="hc-step-chip-text">Evidence</span>
            <span class="hc-step-chip-sub"> — "Why does Tourisma say this?"</span>
          </div>
        </div>
        <div class="hc-step-chip emerald">
          <span class="hc-step-chip-num">4</span>
          <div>
            <span class="hc-step-chip-text">Planning Focus</span>
            <span class="hc-step-chip-sub"> — "What should planners investigate?"</span>
          </div>
        </div>
      </div>
    `;

    // Prompt Suggestions
    const suggestions = document.createElement('div');
    suggestions.className = 'hc-prompt-suggestions';
    suggestions.innerHTML = `
      <span class="hc-prompt-title">Sample Inquiries:</span>
      <div class="hc-prompt-pills-wrap">
        <button type="button" class="hc-prompt-pill" data-query="Provide a national tourism diagnosis for Malaysia with key pressure areas and planning focus.">🇲🇾 National Tourism Diagnosis</button>
        <button type="button" class="hc-prompt-pill" data-query="What is the tourism healthcare access and capacity pressure diagnosis for Melaka and Penang?">🏥 Healthcare & Hospital Bottlenecks</button>
        <button type="button" class="hc-prompt-pill" data-query="Which Malaysian tourism destinations face the highest ecological sensitivity and reserve proximity pressure?">🌿 Ecological Reserves at Risk</button>
        <button type="button" class="hc-prompt-pill" data-query="Provide a diagnosis on Sabah and Sarawak tourism infrastructure and remote healthcare accessibility.">🏝️ Sabah & Sarawak Spatial Diagnosis</button>
      </div>
    `;

    suggestions.querySelectorAll('.hc-prompt-pill').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const q = target.getAttribute('data-query');
        if (q) {
          this.sendMessage(q);
        }
      });
    });

    welcomeWrap.appendChild(frameworkBox);
    welcomeWrap.appendChild(suggestions);
    this.messagesContainer.appendChild(welcomeWrap);
  }

  private async sendMessage(customText?: string): Promise<void> {
    const text = customText !== undefined ? customText.trim() : this.inputElement.value.trim();
    if (!text || this.isLoading) return;

    if (customText === undefined) {
      this.inputElement.value = '';
    }
    this.inputElement.style.height = 'auto';

    // Append User Message
    const userMsg: ChatMessage = {
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.messages.push(userMsg);
    this.appendMessageUI(userMsg);

    this.isLoading = true;
    this.sendButton.disabled = true;
    const thinkingEl = this.showThinking();

    try {
      const response = await fetch('/api/decision-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: this.messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      const botText = data.response || 'No response returned by Compass.';

      const botMsg: ChatMessage = {
        role: 'model',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      this.messages.push(botMsg);
      thinkingEl.remove();
      this.appendMessageUI(botMsg);
    } catch (err: unknown) {
      thinkingEl.remove();
      const errorMsg = err instanceof Error ? err.message : String(err);
      const fallbackMsg: ChatMessage = {
        role: 'model',
        text: `⚠️ **Compass Notice**: Unable to complete query.\n\n*Error details:* ${errorMsg}\n\nPlease verify credentials or check connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      this.appendMessageUI(fallbackMsg);
    } finally {
      this.isLoading = false;
      this.sendButton.disabled = false;
      this.scrollToBottom();
    }
  }

  private showThinking(): HTMLElement {
    const thinkingEl = document.createElement('div');
    thinkingEl.className = 'hc-thinking-indicator';
    thinkingEl.innerHTML = `
      <div class="hc-msg-bot-avatar">
        <img src="/robot-avatar.png" alt="Compass Robot" class="hc-msg-bot-avatar-img hc-avatar-thinking" />
      </div>
      <div class="hc-thinking-dots">
        <span class="hc-thinking-dot"></span>
        <span class="hc-thinking-dot"></span>
        <span class="hc-thinking-dot"></span>
      </div>
      <span>Compass is synthesizing decision framework...</span>
    `;
    this.messagesContainer.appendChild(thinkingEl);
    this.scrollToBottom();
    return thinkingEl;
  }

  private appendMessageUI(msg: ChatMessage): void {
    const row = document.createElement('div');
    row.className = `hc-msg-row ${msg.role === 'user' ? 'user' : 'bot'}`;

    if (msg.role === 'model') {
      const avatarEl = document.createElement('div');
      avatarEl.className = 'hc-msg-bot-avatar';
      avatarEl.innerHTML = `<img src="/robot-avatar.png" alt="Compass Robot" class="hc-msg-bot-avatar-img" />`;
      row.appendChild(avatarEl);
    }

    const contentWrap = document.createElement('div');
    contentWrap.className = 'hc-msg-content-wrap';

    const bubble = document.createElement('div');
    bubble.className = 'hc-msg-bubble';

    if (msg.role === 'user') {
      bubble.textContent = msg.text;
    } else {
      bubble.innerHTML = this.formatDecisionEngineMarkdown(msg.text);
    }

    const time = document.createElement('span');
    time.className = 'hc-msg-time';
    time.textContent = msg.timestamp;

    contentWrap.appendChild(bubble);
    contentWrap.appendChild(time);
    row.appendChild(contentWrap);

    this.messagesContainer.appendChild(row);
    this.scrollToBottom();
  }

  private parseInlineMarkdown(str: string): string {
    let res = str;
    // Inline code: `code`
    res = res.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold + Italic: ***text*** or ___text___
    res = res.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    res = res.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
    // Bold: **text** or __text__
    res = res.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    res = res.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    // Italic: *text* or _text_
    res = res.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    res = res.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');
    // Clean up any remaining unparsed stray asterisks around words
    res = res.replace(/\*\*/g, '');
    return res;
  }

  private parseBlockMarkdown(content: string): string {
    let text = content.trim();

    // Convert headings (e.g. ### Subheading -> <h4>Subheading</h4>)
    text = text.replace(/^#{1,6}\s+(.*)$/gm, '<h4>$1</h4>');

    // Convert bullet points (* item, - item, • item)
    text = text.replace(/^\s*[\*\-•]\s+(.*)$/gm, '<li>$1</li>');
    // Wrap adjacent <li> in <ul>
    text = text.replace(/(<li>[\s\S]*?<\/li>[\r\n]*)+/g, (m) => `\n\n<ul>\n${m}</ul>\n\n`);

    // Parse inline markdown (bold, italic, code)
    text = this.parseInlineMarkdown(text);

    // Convert into clean paragraphs or blocks
    const blocks = text.split(/\n\n+/).map((b) => {
      b = b.trim();
      if (!b) return '';
      if (b.startsWith('<ul>') || b.startsWith('<ol>') || b.startsWith('<h4>')) {
        return b.replace(/<br\s*\/?>/g, '');
      }
      return `<p>${b.replace(/\n/g, '<br/>')}</p>`;
    });

    return blocks.filter(Boolean).join('');
  }

  private formatDecisionEngineMarkdown(rawText: string): string {
    // Parse specific Decision Engine sections with cards
    const sections = [
      {
        regex: /(?:#{1,6}|\*{1,2})?\s*(?:1\.\s*)?Tourism Diagnosis[^\n]*\n?([\s\S]*?)(?=(?:#{1,6}|\*{1,2})?\s*(?:2\.\s*)?Key Pressure Areas|$)/i,
        className: 'diagnosis',
        badge: '🩺 Tourism Diagnosis ("What is happening?")',
      },
      {
        regex: /(?:#{1,6}|\*{1,2})?\s*(?:2\.\s*)?Key Pressure Areas[^\n]*\n?([\s\S]*?)(?=(?:#{1,6}|\*{1,2})?\s*(?:3\.\s*)?Evidence|$)/i,
        className: 'pressure',
        badge: '⚠️ Key Pressure Areas ("Where is the problem?")',
      },
      {
        regex: /(?:#{1,6}|\*{1,2})?\s*(?:3\.\s*)?Evidence[^\n]*\n?([\s\S]*?)(?=(?:#{1,6}|\*{1,2})?\s*(?:4\.\s*)?Planning Focus|$)/i,
        className: 'evidence',
        badge: '📊 Evidence ("Why does Tourisma say this?")',
      },
      {
        regex: /(?:#{1,6}|\*{1,2})?\s*(?:4\.\s*)?Planning Focus[^\n]*\n?([\s\S]*?)$/i,
        className: 'focus',
        badge: '🎯 Planning Focus ("What should planners investigate?")',
      },
    ];

    let hasMatchedFramework = false;
    let cardsHtml = '';

    for (const sec of sections) {
      const match = rawText.match(sec.regex);
      if (match && match[1]?.trim()) {
        hasMatchedFramework = true;
        const parsedContent = this.parseBlockMarkdown(match[1].trim());

        cardsHtml += `
          <div class="hc-decision-card ${sec.className}">
            <div class="hc-decision-card-badge">${sec.badge}</div>
            <div class="hc-decision-content">${parsedContent}</div>
          </div>
        `;
      }
    }

    if (hasMatchedFramework && cardsHtml) {
      return cardsHtml;
    }

    // Default fallback markdown formatting
    return this.parseBlockMarkdown(rawText);
  }

  private scrollToBottom(): void {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}
