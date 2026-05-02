/**
 * Popup Script
 * Handles user interactions in the extension popup
 * Note: CONFIG is loaded as a global from config.js script
 */

class PopupController {
  constructor() {
    this.currentTab = null;
    this.isTranslating = false;
    this.initializeElements();
    this.setupEventListeners();
  }

  /**
   * Cache DOM elements for frequent access
   */
  initializeElements() {
    this.elements = {
      sourceLang: document.getElementById('sourceLang'),
      targetLang: document.getElementById('targetLang'),
      swapBtn: document.getElementById('swapLangs'),
      translateBtn: document.getElementById('translateBtn'),
      resetBtn: document.getElementById('resetBtn'),
      progressSection: document.getElementById('progressSection'),
      progressFill: document.getElementById('progressFill'),
      progressText: document.getElementById('progressText'),
      errorMessage: document.getElementById('errorMessage'),
      successMessage: document.getElementById('successMessage')
    };
  }

  /**
   * Setup event listeners for UI interactions
   */
  setupEventListeners() {
    this.elements.translateBtn.addEventListener('click', () => this.handleTranslate());
    this.elements.resetBtn.addEventListener('click', () => this.handleReset());
    this.elements.swapBtn.addEventListener('click', () => this.handleSwapLanguages());

    // Auto-update on language selection change
    this.elements.sourceLang.addEventListener('change', () => this.validateLanguagePair());
    this.elements.targetLang.addEventListener('change', () => this.validateLanguagePair());
  }

  /**
   * Validate language pair is supported
   */
  validateLanguagePair() {
    const src = this.elements.sourceLang.value;
    const tgt = this.elements.targetLang.value;

    if (src === tgt) {
      this.showError('Source and target languages must be different');
      this.elements.sourceLang.value = 'en';
      this.elements.targetLang.value = 'ne';
      return false;
    }

    const isValid = CONFIG.TRANSLATION_PAIRS.some(
      pair => pair.from === src && pair.to === tgt
    );

    if (!isValid) {
      this.showError(`Translation pair ${src} → ${tgt} is not supported`);
      this.elements.targetLang.value = 'ne';
      return false;
    }

    return true;
  }

  /**
   * Handle translate button click
   */
  async handleTranslate() {
    if (!this.validateLanguagePair()) {
      return;
    }

    const srcLang = this.elements.sourceLang.value;
    const tgtLang = this.elements.targetLang.value;

    if (this.isTranslating) {
      this.showError('Translation already in progress');
      return;
    }

    this.isTranslating = true;
    this.elements.translateBtn.disabled = true;
    this.showProgress(true);
    this.clearMessages();

    try {
      console.log(`[Popup] Starting translation: ${srcLang} → ${tgtLang}`);

      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;

      // Send translation command to content script
      const response = await this.sendMessage({
        action: 'START_TRANSLATION',
        srcLang: srcLang,
        tgtLang: tgtLang
      });

      if (response.success) {
        this.showSuccess('Page translation started successfully!');
      } else {
        this.showError('Failed to start translation: ' + response.error);
      }
    } catch (error) {
      console.error('[Popup] Translation error:', error);
      this.showError('Translation error: ' + error.message);
    } finally {
      this.isTranslating = false;
      this.elements.translateBtn.disabled = false;
      this.showProgress(false);
    }
  }

  /**
   * Handle reset button click
   */
  async handleReset() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await this.sendMessage({ action: 'RESET_PAGE' });
      this.showSuccess('Page has been reset to original content');
    } catch (error) {
      console.error('[Popup] Reset error:', error);
      this.showError('Failed to reset page: ' + error.message);
    }
  }

  /**
   * Handle swap languages button click
   */
  handleSwapLanguages() {
    const src = this.elements.sourceLang.value;
    const tgt = this.elements.targetLang.value;

    this.elements.sourceLang.value = tgt;
    this.elements.targetLang.value = src;

    this.validateLanguagePair();
  }

  /**
   * Send message to content script
   */
  async sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!this.currentTab || !this.currentTab.id) {
        reject(new Error('No active tab found'));
        return;
      }

      console.log(`[Popup] Sending message to tab ${this.currentTab.id}:`, message.action);
      
      chrome.tabs.sendMessage(this.currentTab.id, message, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Popup] Tab message error:', chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!response) {
          console.error('[Popup] No response from content script');
          reject(new Error('No response from content script'));
        } else {
          console.log('[Popup] Response received:', response);
          resolve(response);
        }
      });
    });
  }

  /**
   * Update status display
   */
  async updateStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;

      // Get page status from content script
      const response = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_STATUS' }, (response) => {
          resolve(response || { isTranslating: false, elementCount: 0 });
        });
      }).catch(() => ({ isTranslating: false, elementCount: 0 }));

      // Update button state
      if (response.isTranslating) {
        this.elements.translateBtn.disabled = true;
      } else {
        this.elements.translateBtn.disabled = false;
      }
    } catch (error) {
      console.log('[Popup] Could not get page status');
    }
  }

  /**
   * Show progress indicator
   */
  showProgress(show) {
    if (show) {
      this.elements.progressSection.classList.add('show');
      this.elements.progressText.textContent = 'Translating... Please wait';
    } else {
      this.elements.progressSection.classList.remove('show');
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.classList.add('show');
    this.elements.successMessage.classList.remove('show');

    setTimeout(() => {
      this.elements.errorMessage.classList.remove('show');
    }, 5000);
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.elements.successMessage.textContent = message;
    this.elements.successMessage.classList.add('show');
    this.elements.errorMessage.classList.remove('show');

    setTimeout(() => {
      this.elements.successMessage.classList.remove('show');
    }, 5000);
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    this.elements.errorMessage.classList.remove('show');
    this.elements.successMessage.classList.remove('show');
  }
}

// Initialize popup controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Popup] Initializing popup controller');
  new PopupController();
});
