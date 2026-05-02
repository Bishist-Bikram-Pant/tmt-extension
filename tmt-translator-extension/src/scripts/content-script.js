/**
 * Content Script
 * Injects into the web page and handles DOM translation
 * This script runs in the context of the web page
 * 
 * Note: Content scripts cannot use importScripts() or ES6 imports
 * Configuration is embedded directly in this file
 */

// Configuration values (from CONFIG) - embedded for content script compatibility
const CONTENT_SCRIPT_CONFIG = {
  SELECTORS_TO_TRANSLATE: [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'span', 'div', 'li', 'td', 'th',
    'a', 'button', 'label', 'title'
  ],
  SELECTORS_TO_SKIP: [
    'script', 'style', 'code', 'pre',
    '.no-translate', '[data-no-translate]',
    '.notification', '.alert'
  ],
  UI: {
    MAX_ELEMENTS_PER_BATCH: 100
  },
  TRANSLATION: {
    DELAY_BETWEEN_CALLS: 500,
    MAX_CHARS_PER_REQUEST: 500
  }
};

class PageTranslator {
  constructor() {
    this.isTranslating = false;
    this.currentSrcLang = 'en';
    this.currentTgtLang = 'ne';
    this.translatedElements = new Map(); // Store original content
    this.translationQueue = [];
    this.processingQueue = false;
    this.config = CONTENT_SCRIPT_CONFIG;
  }

  /**
   * Initialize the page translator
   */
  init() {
    console.log('[Content Script] PageTranslator initialized');
    this.setupMessageListener();
  }

  /**
   * Setup message listener for commands from popup/background
   */
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('[Content Script] Message received:', request.action);

      switch (request.action) {
        case 'START_TRANSLATION':
          this.startTranslation(request.srcLang, request.tgtLang);
          sendResponse({ success: true });
          break;

        case 'STOP_TRANSLATION':
          this.stopTranslation();
          sendResponse({ success: true });
          break;

        case 'RESET_PAGE':
          this.resetPage();
          sendResponse({ success: true });
          break;

        case 'GET_PAGE_STATUS':
          sendResponse({
            isTranslating: this.isTranslating,
            srcLang: this.currentSrcLang,
            tgtLang: this.currentTgtLang,
            elementCount: this.translatedElements.size
          });
          break;

        default:
          console.warn('[Content Script] Unknown action:', request.action);
      }
    });
  }

  /**
   * Start translating the page
   */
  async startTranslation(srcLang, tgtLang) {
    if (this.isTranslating) {
      console.log('[Content Script] Translation already in progress');
      return;
    }

    console.log(`[Content Script] Starting translation: ${srcLang} → ${tgtLang}`);
    this.isTranslating = true;
    this.currentSrcLang = srcLang;
    this.currentTgtLang = tgtLang;

    try {
      // Small delay to ensure service worker is ready
      await this.delay(100);
      
      // Get all translatable elements
      const elements = this.getTranslatableElements();
      console.log(`[Content Script] ✓ Found ${elements.length} elements to translate`);

      if (elements.length === 0) {
        console.warn('[Content Script] No translatable elements found on this page');
        console.log('[Content Script] Selectors used:', this.config.SELECTORS_TO_TRANSLATE);
        this.isTranslating = false;
        return;
      }

      // Process elements in batches
      console.log(`[Content Script] Starting batch processing (batch size: ${this.config.UI.MAX_ELEMENTS_PER_BATCH})...`);
      await this.processElementsInBatches(elements);

      // Update status
      this.updateStatus();
      console.log('[Content Script] ✓ Translation completed successfully');
    } catch (error) {
      console.error('[Content Script] Translation error:', error.message);
      this.isTranslating = false;
    }
  }

  /**
   * Get all translatable elements from the page
   */
  getTranslatableElements() {
    const elements = [];
    const selector = this.config.SELECTORS_TO_TRANSLATE.join(', ');
    const skipSelector = this.config.SELECTORS_TO_SKIP.join(', ');

    try {
      const allElements = document.querySelectorAll(selector);

      for (const element of allElements) {
        // Skip if matches skip selectors
        if (element.closest(skipSelector)) {
          continue;
        }

        // Skip if empty
        if (!element.textContent || element.textContent.trim().length === 0) {
          continue;
        }

        // Only process text nodes (not all descendants)
        if (this.hasDirectTextContent(element)) {
          elements.push(element);
        }
      }
    } catch (error) {
      console.error('[Content Script] Error getting elements:', error);
    }

    return elements;
  }

  /**
   * Check if element has direct text content (not just nested elements)
   */
  hasDirectTextContent(element) {
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Process elements in batches to avoid overwhelming the API
   */
  async processElementsInBatches(elements) {
    const batchSize = this.config.UI.MAX_ELEMENTS_PER_BATCH;
    const totalBatches = Math.ceil(elements.length / batchSize);

    for (let i = 0; i < elements.length; i += batchSize) {
      const batchNum = Math.floor(i / batchSize) + 1;
      const batch = elements.slice(i, i + batchSize);
      console.log(`[Content Script] Processing batch ${batchNum}/${totalBatches} (${batch.length} elements)...`);
      
      await this.processBatch(batch);

      // Add delay between batches to respect rate limiting
      if (i + batchSize < elements.length) {
        console.log(`[Content Script] Batch ${batchNum} complete, waiting before next batch...`);
        await this.delay(this.config.TRANSLATION.DELAY_BETWEEN_CALLS * 3);
      }
    }
    
    console.log(`[Content Script] ✓ All ${totalBatches} batches processed`);
  }

  /**
   * Process a batch of elements sequentially (NOT concurrently) to avoid rate limiting
   */
  async processBatch(elements) {
    let successCount = 0;
    for (const element of elements) {
      try {
        await this.translateElement(element);
        successCount++;
      } catch (error) {
        console.error('[Content Script] Failed to translate element:', error);
      }
    }
    console.log(`[Content Script] Batch result: ${successCount}/${elements.length} elements translated`);
  }

  /**
   * Translate a single element
   */
  async translateElement(element) {
    try {
      // Get only DIRECT text nodes (not nested content)
      const directTextNodes = [];
      for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          if (text && text.length > 0 && text.length <= this.config.TRANSLATION.MAX_CHARS_PER_REQUEST) {
            directTextNodes.push({ node, text });
          }
        }
      }

      // Translate each direct text node separately
      for (const { node, text } of directTextNodes) {
        try {
          const response = await this.sendTranslationRequest(
            text,
            this.currentSrcLang,
            this.currentTgtLang
          );

          if (response && response.success) {
            console.log('[Content Script] ✓ Element translated:', {
              original: text.substring(0, 50),
              translated: response.translated.substring(0, 50)
            });

            // Update the text node directly
            node.textContent = response.translated;

            // Add visual indicator to parent element
            element.style.borderLeft = '3px solid #4CAF50';
            element.style.paddingLeft = '5px';

            console.log('[Content Script] DOM updated:', {
              original_length: text.length,
              translated_length: response.translated.length,
              tag: element.tagName
            });
          } else {
            console.error('[Content Script] Translation failed for text:', response?.error || 'No response');
          }
        } catch (error) {
          console.error('[Content Script] Error translating text node:', error.message);
        }

        // Delay between individual API calls
        await this.delay(this.config.TRANSLATION.DELAY_BETWEEN_CALLS);
      }
    } catch (error) {
      console.error('[Content Script] Error translating element:', error.message);
    }
  }

  /**
   * Send translation request to background script with retry logic
   */
  sendTranslationRequest(text, srcLang, tgtLang, retries = 3) {
    return new Promise((resolve, reject) => {
      const sendRequest = (attemptsLeft) => {
        console.log(`[Content Script] Sending translation request (attempt ${4 - attemptsLeft})...`);
        
        chrome.runtime.sendMessage(
          {
            action: 'TRANSLATE_TEXT',
            text: text,
            srcLang: srcLang,
            tgtLang: tgtLang
          },
          (response) => {
            if (chrome.runtime.lastError) {
              const errorMsg = chrome.runtime.lastError.message;
              console.error('[Content Script] Message error:', errorMsg);
              
              // Retry if service worker not ready
              if (errorMsg.includes('Receiving end does not exist') && attemptsLeft > 0) {
                console.log(`[Content Script] Service worker not ready, retrying in 1 second...`);
                setTimeout(() => sendRequest(attemptsLeft - 1), 1000);
              } else if (attemptsLeft > 0) {
                // Retry on other errors too
                console.log(`[Content Script] Error occurred, retrying in 1 second...`);
                setTimeout(() => sendRequest(attemptsLeft - 1), 1000);
              } else {
                reject(new Error(errorMsg));
              }
            } else if (!response) {
              console.error('[Content Script] No response from background');
              if (attemptsLeft > 0) {
                setTimeout(() => sendRequest(attemptsLeft - 1), 1000);
              } else {
                reject(new Error('No response from background service worker'));
              }
            } else {
              console.log('[Content Script] Translation response received:', response.translated?.substring(0, 50));
              resolve(response);
            }
          }
        );
      };
      
      sendRequest(retries);
    });
  }

  /**
   * Find first text node efficiently (max depth 3, breadth-first)
   */
  findFirstTextNode(element, depth = 0) {
    // Limit recursion depth to avoid performance issues
    if (depth > 2) return null;

    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
        return node;
      }
    }

    // Only recurse if we haven't found text yet and depth allows
    if (depth < 2) {
      for (const node of element.childNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const textNode = this.findFirstTextNode(node, depth + 1);
          if (textNode) return textNode;
        }
      }
    }
    return null;
  }

  /**
   * Generate unique ID for element
   */
  getElementId(element) {
    // Use element's position in DOM or create a WeakMap entry
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Stop translation and revert changes
   */
  stopTranslation() {
    console.log('[Content Script] Stopping translation');
    this.isTranslating = false;
  }

  /**
   * Reset the page to original state
   */
  resetPage() {
    console.log('[Content Script] Resetting page');

    for (const data of this.translatedElements.values()) {
      data.element.textContent = data.original;
      data.element.style.borderLeft = 'none';
      data.element.style.paddingLeft = '0';
    }

    this.translatedElements.clear();
    this.isTranslating = false;
    this.updateStatus();
  }

  /**
   * Get unique ID for an element
   */
  getElementId(element) {
    if (element.id) {
      return element.id;
    }

    // Generate a pseudo-ID based on position and text content hash
    const text = element.textContent.substring(0, 20);
    const hash = this.simpleHash(text);
    return `elem_${hash}`;
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Update status in background script
   */
  updateStatus() {
    const tabId = chrome.runtime.id;
    chrome.runtime.sendMessage({
      action: 'SET_TRANSLATION_STATE',
      tabId: tabId,
      state: {
        isTranslating: this.isTranslating,
        srcLang: this.currentSrcLang,
        tgtLang: this.currentTgtLang,
        elementCount: this.translatedElements.size
      }
    });
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize on page load
const pageTranslator = new PageTranslator();
pageTranslator.init();

// Expose globally for debugging
window.pageTranslator = pageTranslator;

console.log('[Content Script] Loaded and ready');
