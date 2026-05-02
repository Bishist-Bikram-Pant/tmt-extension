# Google TMT Translator Extension

A real-time web page translation browser extension for the Google TMT Hackathon 2026. Translate web content instantly using the Google Trilingual Machine Translation API.

## Overview

The Google TMT Translator Extension is a Chrome browser tool that allows you to translate web page content instantly between English, Nepali, and Tamang languages. The extension features a clean, minimal interface that makes translation simple and straightforward.

**For detailed user instructions, see [USER_GUIDE.md](USER_GUIDE.md)**

## Features

- Real-time translation of visible web page content
- Support for three languages: English, Nepali, and Tamang
- Bidirectional translation for all supported language pairs
- Smart caching to reduce API calls
- Simple, intuitive popup interface
- One-click reset to restore original content
- Progress tracking during translation

## Supported Language Pairs

- English ↔ Nepali
- English ↔ Tamang
- Nepali ↔ Tamang

## Quick Start

1. Open `chrome://extensions/` in Chrome
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" and select this folder
4. Add your API key to `src/scripts/config.js`
5. Click the extension icon and select your languages
6. Click "Translate" to begin

## Getting Started

### Installation

1. Open `chrome://extensions/` in Chrome
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked" and select this folder
4. Add your API key to `src/scripts/config.js` (line 10)
5. Refresh the extension in the extensions page
6. Click the extension icon on any website to start translating

### Configuration

Edit `src/scripts/config.js` to customize:
- API_KEY: Your TMT API credentials
- MAX_ELEMENTS_PER_BATCH: Number of elements processed at once (default: 50)
- DELAY_BETWEEN_CALLS: Wait time between API calls (default: 1000ms)
- CACHE_EXPIRY: How long to cache translations (default: 60 minutes)
- SELECTORS_TO_TRANSLATE: Which HTML elements to translate
- SELECTORS_TO_SKIP: Which elements to skip

After changes, refresh the extension from the extensions page.

## Project Structure

```
tmt-translator-extension/
├── manifest.json                 # Extension configuration
├── README.md                     # This file
├── USER_GUIDE.md                 # Detailed user instructions
│
├── src/
│   ├── scripts/
│   │   ├── config.js            # Configuration & constants
│   │   ├── translation-service.js # API communication & retry logic
│   │   ├── background.js        # Service worker (message router)
│   │   └── content-script.js    # Page translator (DOM manipulation)
│   │
│   ├── popup/
│   │   ├── popup.html           # Extension popup UI
│   │   └── popup.js             # Popup controller
│   │
│   ├── styles/
│   │   └── popup.css            # Popup styling
│   │
│   └── assets/
│       └── icon-*.png           # Extension icons (16x16, 48x48, 128x128)
```

## Technical Architecture

The extension uses a client-server architecture with message passing:

**Components:**
- **Content Script** (content-script.js): Runs on every webpage, identifies translatable elements, updates DOM
- **Service Worker** (background.js): Central message hub routing between popup and content script
- **Translation Service** (translation-service.js): Handles API calls with retry logic and caching
- **Popup UI** (popup.js): User interface for controlling translations

**Communication Flow:**
```
Popup UI → Service Worker → Content Script → Translation Service → Google TMT API
                                       ↓
                            (Updates visible text on page)
```

## Recent Improvements (v1.0.0)

- Fixed English to Tamang translation error by improving language code validation
- Simplified UI to minimal design (Translate and Reset buttons)
- Enhanced retry logic with support for alternative Tamang language codes (tmg, tam, tag, tg)
- Added parameter validation before API calls
- Improved error messages for better debugging

## Known Limitations

- Does not translate text within images or graphics
- Does not translate code blocks or script content
- Requires stable internet connection
- Very large pages may take time to process
- Some special characters may not translate correctly
- Not compatible with restricted pages (chrome://, about:, etc.)

## Troubleshooting

**See [USER_GUIDE.md](USER_GUIDE.md) for detailed troubleshooting steps**

Quick fixes:
- API Error: Verify API key in config.js
- Nothing translating: Try refreshing the page
- Slow translation: Close other tabs and try a simpler page
- Extension not visible: Click Extensions menu → pin the extension

## API Information

- **Endpoint:** https://tmt.ilprl.ku.edu.np/lang-translate
- **Authentication:** Bearer token via API_KEY
- **Rate Limiting:** Implements exponential backoff (max 10 seconds)
- **Retry Strategy:** Up to 2 retries for most errors, alternative codes for Tamang
- **Caching:** Local browser storage with 60-minute expiry

## Browser Support

- Chrome 88+
- Chromium-based browsers (Edge, Brave, etc.)

## Version

Current: 1.0.0
Manifest Version: 3

## Support

For detailed usage instructions, see [USER_GUIDE.md](USER_GUIDE.md)

For technical details and debugging, check browser console (F12 → Console tab)

### Cannot Establish Connection Error

This usually means the content script is not loaded on the page:

1. Refresh the webpage
2. Click the extension icon again
3. Try translating a different website first
4. Restart your browser if problems persist

## API Information

The extension communicates with the Google TMT API for translation services. Key details:

- Endpoint: https://tmt.ilprl.ku.edu.np/lang-translate
- Authentication: API key-based
- Request Format: JSON with source text, source language, and target language
- Response Format: JSON with translated text
- Rate Limiting: The extension implements intelligent retry logic for handling rate limits

The API requires three pieces of information for each translation request:

1. The text to translate
2. The source language code (en, ne, tmg)
3. The target language code (en, ne, tmg)

## System Architecture

The extension consists of the following components working together:

Popup Interface -> Service Worker -> Content Script
                             |
                             V
                      Translation API Service

When you click "Translate", the popup sends a message to the service worker, which forwards it to the content script running on the webpage. The content script identifies translatable elements and sends them to the translation service, which contacts the Google TMT API and returns translated text. The content script then updates the webpage with the translated content.

## Storage and Caching

The extension uses browser storage to cache translations:

- Recent translations are stored locally in the browser
- Cached translations reduce API calls and improve performance
- Cache entries expire after 60 minutes by default
- You can clear the cache by refreshing the extension

## Privacy

The extension operates entirely within your browser. No personal data is stored or transmitted except:

- The text you choose to translate (sent to Google TMT API)
- Your API key (stored locally in configuration)
- Translation cache (stored in browser storage)

## Known Limitations

- The extension works best with text-based content
- Very large pages may take time to translate
- Some special characters may not translate correctly
- The extension requires an active internet connection
- Some websites with strict content security policies may block the extension

## Support and Feedback

For issues or suggestions:

1. Check the console logs for error messages (right-click > Inspect > Console)
2. Verify all configuration steps are completed correctly
3. Test with a different website to isolate the problem
4. Restart your browser and try again

## File Structure Reference

For developers wanting to understand the codebase:

- manifest.json: Extension configuration and permissions
- config.js: Constants and settings
- translation-service.js: API communication logic
- background.js: Service worker and message routing
- content-script.js: Page translation logic and DOM manipulation
- popup.js: Popup interface controller
- popup.css: Visual styling for the popup
- popup.html: Popup layout and elements

## Version Information

Current Version: 1.0.0
Compatible Browsers: Chrome 88+
API Version: Google TMT v1
Manifest Version: 3

## Final Tips

1. Start with simple websites to ensure the extension works
2. Test with different language pairs to find what works best
3. Keep your API key private and secure
4. Regularly check for updates to the extension
5. Report any unusual behavior for debugging

The extension is now ready to use. Simply navigate to any webpage and click the extension icon to begin translating content in real-time.
