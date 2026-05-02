# Google TMT Translator Extension

A real-time web page translation browser extension for the Google TMT Hackathon 2026. Translate web content instantly using the Google Trilingual Machine Translation API.

## Overview

The Google TMT Translator Extension is a Chrome browser tool that allows you to translate web page content instantly between English, Nepali, and Tamang languages. The extension features a clean, minimal interface that makes translation simple and straightforward.

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

## System Requirements

- Google Chrome or Chromium-based browser (version 88 or higher)
- Internet connection for API access
- API key from the Google TMT Hackathon registration
- Minimum 2GB RAM available in your system
- Modern processor (Intel Core i5 or equivalent)

---

## Installation & Setup

### Step 1: Installation

1. Open your Chrome browser
2. Go to `chrome://extensions/` in the address bar
3. Enable "Developer mode" using the toggle button in the top right corner
4. Click the "Load unpacked" button
5. Navigate to the tmt-translator-extension folder and select it
6. The extension will now appear in your Chrome toolbar

### Step 2: Add Your API Key

The extension needs an API key to communicate with the translation service.

1. Open the file `src/scripts/config.js` in a text editor
2. Find this line:
   ```javascript
   API_KEY: 'team_xxxxxxxxxxxxxxxx',
   ```
3. Replace the placeholder with your actual API key
4. Save the file
5. Go back to the extensions page and click the refresh icon on the translator extension

### Step 3: Test the Extension

Once installed and configured:

1. Visit any website with text content
2. Click the extension icon in your Chrome toolbar
3. The popup will show language selection options
4. Click the "Translate" button to start translating the page
5. Watch as the text on the webpage gets translated

---

## How to Use

### Basic Translation

1. Navigate to any website you want to translate
2. Click the extension icon in your toolbar
3. The popup displays:
   - A "From" language selector (source language)
   - A "To" language selector (target language)
   - A swap button (arrow icon) to switch source and target languages
   - A progress bar showing translation status
   - Translate and Reset buttons

### Changing Languages

To change languages:

1. Click on the "From" dropdown to select the source language
2. Click on the "To" dropdown to select the target language
3. Click the arrow button to swap the source and target languages
4. Click "Translate" to start the translation

### What Gets Translated

The extension translates most visible text on a webpage, including:

- Paragraph text
- Headings and subheadings
- Links
- Button labels
- List items
- Table cells
- Span elements

The extension does NOT translate:

- Text in images or graphics
- Code or script content
- Text inside style elements
- Content marked as "no-translate"
- Certain embedded media

### Resetting the Page

To go back to the original content:

1. Click the extension icon
2. Click the "Reset" button
3. The page will return to its original language immediately

### Understanding the Progress Bar

While translation is happening, a blue progress bar appears in the popup, showing that the extension is actively translating content. Once the bar completes, all visible translations are done.

---

## Configuration Options

For users who want to customize how the extension works, edit `src/scripts/config.js`:

- **API_KEY**: Your TMT API credentials
- **MAX_ELEMENTS_PER_BATCH**: Controls how many page elements are processed at one time (default: 50)
- **DELAY_BETWEEN_CALLS**: Wait time between API requests in milliseconds (default: 1000ms)
- **CACHE_EXPIRY**: How long translated content is stored before requiring new translation (default: 60 minutes)
- **SELECTORS_TO_TRANSLATE**: Which HTML elements should be translated
- **SELECTORS_TO_SKIP**: Which elements should not be translated

After changing any configuration, refresh the extension from the extensions page.

---

## Technical Details

### Project Structure

```
tmt-translator-extension/
├── manifest.json                 # Extension configuration
├── README.md                     # This file
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

### Technical Architecture

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

When you click "Translate", the popup sends a message to the service worker, which forwards it to the content script running on the webpage. The content script identifies translatable elements and sends them to the translation service, which contacts the Google TMT API and returns translated text. The content script then updates the webpage with the translated content.

### API Information

The extension communicates with the Google TMT API for translation services:

- **Endpoint**: https://tmt.ilprl.ku.edu.np/lang-translate
- **Authentication**: Bearer token via API_KEY
- **Request Format**: JSON with source text, source language, and target language
- **Response Format**: JSON with translated text
- **Rate Limiting**: Implements exponential backoff (max 10 seconds)
- **Retry Strategy**: Up to 2 retries for most errors, alternative codes for Tamang
- **Language Codes**: en (English), ne (Nepali), tmg/tam/tag/tg (Tamang variants)

Each translation request requires:
1. The text to translate
2. The source language code (en, ne, tmg)
3. The target language code (en, ne, tmg)

### Storage and Caching

The extension uses browser storage to cache translations:

- Recent translations are stored locally in the browser
- Cached translations reduce API calls and improve performance
- Cache entries expire after 60 minutes by default
- You can clear the cache by refreshing the extension

### Privacy

The extension operates entirely within your browser. No personal data is stored or transmitted except:

- The text you choose to translate (sent to Google TMT API)
- Your API key (stored locally in configuration)
- Translation cache (stored in browser storage)

---

## Performance Considerations

The extension works most efficiently when:

- Processing pages with moderate amounts of text
- Waiting for the progress bar to complete before navigating away
- Keeping the browser window focused on the translating page
- Using a stable internet connection with good bandwidth

Large pages with thousands of elements may take several seconds to translate completely. The extension processes elements in batches to avoid overwhelming the system.

---

## Known Limitations

- Does not translate text within images or graphics
- Does not translate code blocks or script content
- Requires stable internet connection
- Very large pages may take time to process
- Some special characters may not translate correctly
- Not compatible with restricted pages (chrome://, about:, etc.)
- Some websites with strict content security policies may block the extension

---

## Troubleshooting

### Extension Does Not Appear in Toolbar

If you don't see the extension icon:

1. Click the Extensions menu icon in Chrome (top right)
2. Find "Google TMT Translator"
3. Click the pin icon next to it to add it to your main toolbar

### Getting "Translation Error" Messages

If you see error messages during translation:

1. Check that your API key is correctly configured in config.js
2. Verify that your internet connection is working
3. Try reloading the page before translating again
4. If the error persists, refresh the extension from the extensions page

### Cannot Establish Connection Error

This usually means the content script is not loaded on the page:

1. Refresh the webpage
2. Click the extension icon again
3. Try translating a different website first
4. Restart your browser if problems persist

### Some Text Not Translating

If certain text on the page is not translating:

1. The text might be inside an image or graphic (these cannot be translated)
2. The text might be in a code block or script (intentionally skipped)
3. Try zooming in to see if smaller elements are translated
4. Clear the cache and try again

### Translation Takes Too Long

If translation is slow:

1. Check your internet connection speed
2. Close other browser tabs to free up system resources
3. Try translating a simpler page first
4. Refresh the extension and try again

### For Debugging

Check the browser console for error messages:
1. Right-click on the page → Select "Inspect"
2. Go to the "Console" tab
3. Look for error messages that can help diagnose the issue

---

## Recent Improvements (v1.0.0)

- Fixed English to Tamang translation error by improving language code validation
- Simplified UI to minimal design (Translate and Reset buttons)
- Enhanced retry logic with support for alternative Tamang language codes (tmg, tam, tag, tg)
- Added parameter validation before API calls
- Improved error messages for better debugging

---

## Browser Support

- Chrome 88+
- Chromium-based browsers (Edge, Brave, etc.)

## Version Information

- **Current Version**: 1.0.0
- **Manifest Version**: 3
- **API Version**: Google TMT v1
- **Compatible Browsers**: Chrome 88+

---

## Tips for Best Results

1. Start with simple websites to ensure the extension works
2. Test with different language pairs to find what works best
3. Keep your API key private and secure
4. Regularly check for updates to the extension
5. Report any unusual behavior for debugging
6. Use the console (F12) to check for technical errors

The extension is now ready to use. Simply navigate to any webpage and click the extension icon to begin translating content in real-time.
