/**
 * Translation Service
 * Handles all communication with the TMT API
 * Compatible with service workers (no ES6 imports)
 */

class TranslationService {
  constructor() {
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
  }

  /**
   * Translates text from source language to target language
   * @param {string} text - The text to translate
   * @param {string} srcLang - Source language code (en, ne, tmg)
   * @param {string} tgtLang - Target language code (en, ne, tmg)
   * @returns {Promise<string>} - Translated text
   */
  async translate(text, srcLang, tgtLang) {
    if (!text || text.trim().length === 0) {
      return text;
    }

    // Check cache first if enabled
    if (CONFIG.TRANSLATION.ENABLE_CACHE) {
      const cached = this.getCachedTranslation(text, srcLang, tgtLang);
      if (cached) {
        console.log('[Translation Service] Cache hit for:', text.substring(0, 50));
        return cached;
      }
    }

    // Validate language pair
    if (!this.isValidLanguagePair(srcLang, tgtLang)) {
      console.error(`Invalid language pair: ${srcLang} → ${tgtLang}`);
      return text;
    }

    try {
      const result = await this.makeAPICall(text, srcLang, tgtLang);
      
      // Cache the result
      if (CONFIG.TRANSLATION.ENABLE_CACHE) {
        this.cacheTranslation(text, srcLang, tgtLang, result);
      }
      
      return result;
    } catch (error) {
      console.error('[Translation Service] Translation failed:', error);
      throw error;
    }
  }

  /**
   * Makes API call to TMT endpoint with exponential backoff for rate limiting
   * Tries alternative language codes for Tamang if rate limited
   * @private
   */
  async makeAPICall(text, srcLang, tgtLang) {
    // Map language codes to API codes (especially for Tamang alternatives)
    const mapLanguageCode = (code) => {
      const mapped = CONFIG.API_LANGUAGE_CODES?.[code] || code;
      console.log(`[Translation Service] Mapping language code: ${code} -> ${mapped}`);
      return mapped;
    };

    let apiSrcLang = mapLanguageCode(srcLang);
    let apiTgtLang = mapLanguageCode(tgtLang);

    // Validate that language codes were mapped successfully
    if (!apiSrcLang || !apiTgtLang) {
      throw new Error(`Invalid language codes: src=${apiSrcLang}, tgt=${apiTgtLang}`);
    }

    // Validate text
    if (!text || text.trim().length === 0) {
      throw new Error('Text to translate is empty');
    }

    // Try alternative Tamang codes if primary fails
    const tamangAlternatives = ['tmg', 'tam', 'tag', 'tg'];
    let tamangCodeIndexSrc = -1;
    let tamangCodeIndexTgt = -1;
    
    if (srcLang === 'tmg') {
      tamangCodeIndexSrc = 0; // Start with first alternative for source
    }
    if (tgtLang === 'tmg') {
      tamangCodeIndexTgt = 0; // Start with first alternative for target
    }

    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount < maxRetries || tamangCodeIndexSrc < tamangAlternatives.length || tamangCodeIndexTgt < tamangAlternatives.length) {
      try {
        // Validate parameters before making API call
        if (!text || !apiSrcLang || !apiTgtLang) {
          throw new Error(`Missing parameters: text=${!!text}, src_lang=${!!apiSrcLang}, tgt_lang=${!!apiTgtLang}`);
        }

        const payload = {
          text: text,
          src_lang: apiSrcLang,
          tgt_lang: apiTgtLang
        };

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.API.API_KEY}`
        };

        console.log(`[Translation Service] API call (attempt ${retryCount + 1}): ${apiSrcLang} → ${apiTgtLang}`);
        console.log(`[Translation Service] Text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          CONFIG.API.REQUEST_TIMEOUT
        );

        const response = await fetch(CONFIG.API.BASE_URL, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Read response as text first to see what we got
        const responseText = await response.text();
        console.log('[Translation Service] Response status:', response.status, response.statusText);

        // Handle 429 (Too Many Requests) with special Tamang handling
        if (response.status === 429) {
          // If source is Tamang, try alternative language code
          if (srcLang === 'tmg' && tamangCodeIndexSrc < tamangAlternatives.length) {
            apiSrcLang = tamangAlternatives[tamangCodeIndexSrc];
            tamangCodeIndexSrc++;
            console.warn(`[Translation Service] Rate limited (429). Trying alternative source Tamang code: ${apiSrcLang}`);
            continue; // Retry with new code immediately
          }

          // If this is target Tamang, try alternative language code before exponential backoff
          if (tgtLang === 'tmg' && tamangCodeIndexTgt < tamangAlternatives.length) {
            apiTgtLang = tamangAlternatives[tamangCodeIndexTgt];
            tamangCodeIndexTgt++;
            console.warn(`[Translation Service] Rate limited (429). Trying alternative target Tamang code: ${apiTgtLang}`);
            continue; // Retry with new code immediately
          }

          // Otherwise, use exponential backoff with a CAP of 10 seconds
          const waitTime = Math.min(Math.pow(2, retryCount) * 1000, 10000); // Cap at 10s max
          console.warn(`[Translation Service] Rate limited (429). Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue; // Retry the request
        }

        // Try to parse as JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('[Translation Service] Failed to parse response as JSON. Response starts with:', responseText.substring(0, 100));
          throw new Error(`API returned invalid JSON (status ${response.status}): ${responseText.substring(0, 100)}`);
        }

        if (data.message_type === 'SUCCESS') {
          console.log(`[Translation Service] Translation successful (${apiSrcLang}→${apiTgtLang}): "${data.output.substring(0, 100)}${data.output.length > 100 ? '...' : ''}"`);
          return data.output;
        } else if (data.message_type === 'error' || data.message) {
          console.error('[Translation Service] API error response:', data.message);
          throw new Error(`API Error: ${data.message || 'Unknown error'}`);
        } else {
          console.error('[Translation Service] Unexpected API response:', JSON.stringify(data).substring(0, 100));
          throw new Error(`Unexpected API response: ${JSON.stringify(data)}`);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Translation request timed out');
        }
        throw error;
      }
    }

    throw new Error('Max retries exceeded for API call');
  }

  /**
   * Validates if language pair is supported
   * @private
   */
  isValidLanguagePair(srcLang, tgtLang) {
    if (srcLang === tgtLang) {
      console.warn(`[Translation Service] Invalid pair: source and target are the same (${srcLang})`);
      return false;
    }

    const supported = CONFIG.TRANSLATION_PAIRS.some(
      pair => pair.from === srcLang && pair.to === tgtLang
    );

    if (!supported) {
      console.error(`[Translation Service] Unsupported language pair: ${srcLang} → ${tgtLang}`);
      console.log('[Translation Service] Supported pairs:', CONFIG.TRANSLATION_PAIRS.map(p => `${p.from}→${p.to}`).join(', '));
    }

    return supported;
  }

  /**
   * Gets cached translation if available and not expired
   * @private
   */
  getCachedTranslation(text, srcLang, tgtLang) {
    const key = this.getCacheKey(text, srcLang, tgtLang);
    const cached = this.cache.get(key);

    if (cached) {
      const now = Date.now();
      const expiryTime = CONFIG.TRANSLATION.CACHE_EXPIRY * 60 * 1000;

      if (now - cached.timestamp < expiryTime) {
        return cached.translation;
      } else {
        this.cache.delete(key);
      }
    }

    return null;
  }

  /**
   * Caches a translation result
   * @private
   */
  cacheTranslation(text, srcLang, tgtLang, translation) {
    const key = this.getCacheKey(text, srcLang, tgtLang);
    this.cache.set(key, {
      translation: translation,
      timestamp: Date.now()
    });
  }

  /**
   * Generates cache key from text and language pair
   * @private
   */
  getCacheKey(text, srcLang, tgtLang) {
    // Simple hash of text to avoid excessively long keys
    const hash = this.simpleHash(text);
    return `${hash}_${srcLang}_${tgtLang}`;
  }

  /**
   * Simple hash function for cache keys
   * @private
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Clears the translation cache
   */
  clearCache() {
    this.cache.clear();
    console.log('[Translation Service] Cache cleared');
  }

  /**
   * Gets cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: CONFIG.TRANSLATION.MAX_CHARS_PER_REQUEST
    };
  }

  /**
   * Detects language of given text
   * @param {string} text - Text to detect language for
   * @returns {string} - Detected language code or null
   */
  detectLanguage(text) {
    if (!text) return null;

    // Nepali script detection (Devanagari script)
    const nepaliScriptRegex = /[\u0900-\u097F]/g;
    // Tamang script detection (also uses Devanagari)
    // For now, we'll use a combination approach

    const nepaliMatches = text.match(nepaliScriptRegex) || [];
    const nepaliRatio = nepaliMatches.length / text.length;

    // If more than 50% of characters are Devanagari, likely Nepali or Tamang
    if (nepaliRatio > 0.5) {
      // Additional heuristics could be added here to distinguish Tamang
      return 'ne'; // Default to Nepali for now
    }

    // English detection (Latin script)
    const latinRegex = /[a-zA-Z0-9\s.,!?;:'"]/g;
    const latinMatches = text.match(latinRegex) || [];
    const latinRatio = latinMatches.length / text.length;

    if (latinRatio > 0.5) {
      return 'en';
    }

    return null;
  }
}

// Create singleton instance globally (compatible with service workers)
const translationService = new TranslationService();
