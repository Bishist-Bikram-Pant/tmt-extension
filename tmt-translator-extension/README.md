# Google TMT Translator Extension - User Guide

Welcome to the Google TMT Translator Extension. This guide will walk you through everything you need to know to use this browser extension for translating web pages in real-time.

## Overview

The Google TMT Translator Extension is a Chrome browser tool that allows you to translate web page content instantly between English, Nepali, and Tamang languages. Instead of manually copying and pasting text into a translation service, this extension translates the content right on the page you're viewing.

## System Requirements

The extension requires the following to run properly:

- Google Chrome or Chromium-based browser (version 88 or higher)
- Internet connection for API access
- API key from the Google TMT Hackathon registration
- Minimum 2GB RAM available in your system
- Modern processor (Intel Core i5 or equivalent)

## Getting Started

### Step 1: Installation

1. Open your Chrome browser
2. Go to the extension settings page by typing `chrome://extensions/` in the address bar
3. Enable "Developer mode" using the toggle button in the top right corner
4. Click the "Load unpacked" button
5. Navigate to the tmt-translator-extension folder and select it
6. The extension will now appear in your Chrome toolbar

### Step 2: Add Your API Key

The extension needs an API key to communicate with the translation service. This key is provided during hackathon registration.

1. Open the file `src/scripts/config.js` in a text editor
2. Find this line in the file:
   ```
   API_KEY: 'team_xxxxxxxxxxxxxxxx',
   ```
3. Replace the placeholder with your actual API key
4. Save the file
5. Go back to the extensions page and click the refresh icon on the translator extension

### Step 3: Test the Extension

Once installed and configured, test the extension with these steps:

1. Visit any website with text content (for example, www.example.com)
2. Click the extension icon in your Chrome toolbar
3. A popup window will appear with translation options
4. The default settings show "English to Nepali" translation
5. Click the "Translate" button to start translating the page
6. Watch as the text on the webpage gets translated

## How to Use

### Basic Translation

1. Navigate to any website you want to translate
2. Click the extension icon in your toolbar
3. The popup will show:
   - A "From" language selector (source language)
   - A "To" language selector (target language)
   - A swap button (arrow icon) to switch the source and target languages
   - A progress bar that shows translation status
   - Translate and Reset buttons

### Changing Languages

The extension supports these language combinations:

- English to Nepali (and vice versa)
- English to Tamang (and vice versa)
- Nepali to Tamang (and vice versa)

To change languages:

1. Click on the "From" dropdown to select the source language
2. Click on the "To" dropdown to select the target language
3. If you want to swap the source and target languages, click the arrow button between them
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

If you want to go back to the original content:

1. Click the extension icon
2. Click the "Reset" button
3. The page will return to its original language immediately

### Understanding the Progress Bar

While translation is happening, a blue progress bar appears in the popup. This shows that the extension is actively translating content on the page. Once the bar completes, all visible translations are done.

## Configuration Options

For users who want to customize how the extension works, the configuration file located at `src/scripts/config.js` contains these adjustable settings:

- MAX_ELEMENTS_PER_BATCH: Controls how many page elements are processed at one time
- DELAY_BETWEEN_CALLS: The wait time between API requests (in milliseconds)
- CACHE_EXPIRY: How long translated content is stored before requiring new translation (in minutes)
- SELECTORS_TO_TRANSLATE: Which HTML elements should be translated
- SELECTORS_TO_SKIP: Which elements should not be translated

After changing any configuration, refresh the extension from the extensions page.

## Technical Details

The extension operates on a client-server architecture with these components:

1. Content Script: Runs on every webpage and identifies translatable text elements
2. Service Worker: Manages communication between the popup and content script
3. Translation Service: Handles API requests to the Google TMT backend
4. Popup Interface: Provides the user interface for controlling translations

The extension uses Chrome's Message Passing API for communication between components. Translation requests are sent to the Google TMT API endpoint at tmt.ilprl.ku.edu.np/lang-translate.

## Performance Considerations

The extension works most efficiently when:

- Processing pages with moderate amounts of text
- Waiting for the progress bar to complete before navigating away
- Keeping the browser window focused on the translating page
- Using a stable internet connection with good bandwidth

Large pages with thousands of elements may take several seconds to translate completely. The extension processes elements in batches to avoid overwhelming the system.

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
