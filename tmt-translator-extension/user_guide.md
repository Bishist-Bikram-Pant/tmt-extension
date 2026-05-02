# Google TMT Translator Extension - Browser Plugin

A real-time web page translation browser extension for the **Google TMT Hackathon 2026**. Translate web content instantly using the Google Trilingual Machine Translation API.

## 🌍 Features

- **Real-time Translation**: Translate visible web page content without reloading
- **Bidirectional Support**: English ↔ Nepali, English ↔ Tamang, Nepali ↔ Tamang
- **Smart Caching**: Reduces API calls for improved performance
- **Batch Processing**: Handles large pages efficiently
- **One-Click Reset**: Revert page to original content anytime
- **Language Detection**: Detects page language automatically
- **Beautiful UI**: Clean, intuitive popup interface
- **Progress Tracking**: Real-time translation status and statistics

## 📋 Supported Language Pairs

| From | To | Support |
|------|-----|---------|
| English | Nepali | ✅ |
| Nepali | English | ✅ |
| English | Tamang | ✅ |
| Tamang | English | ✅ |
| Nepali | Tamang | ✅ |
| Tamang | Nepali | ✅ |

## 📁 Project Structure

```
tmt-translator-extension/
├── manifest.json                 # Extension configuration
├── LOGIC_EXPLANATION.md          # Detailed architecture & logic documentation
├── README.md                     # This file
│
└── src/
    ├── scripts/
    │   ├── config.js            # Configuration & constants
    │   ├── translation-service.js # Core translation API handler
    │   ├── background.js        # Service worker (message hub)
    │   └── content-script.js    # Page translator (DOM manipulation)
    │
    ├── popup/
    │   ├── popup.html           # Extension popup UI
    │   └── popup.js             # Popup controller & event handling
    │
    ├── styles/
    │   └── popup.css            # Popup styling
    │
    └── assets/
        ├── icon-16.png          # Extension icon (16x16)
        ├── icon-48.png          # Extension icon (48x48)
        └── icon-128.png         # Extension icon (128x128)
```

## 🚀 Installation

### Prerequisites
- Google Chrome/Chromium browser (Version 88+)
- API key from Google TMT Hackathon registration

### Steps

1. **Clone or Download the Repository**
   ```bash
   # Navigate to your desired directory
   cd ~/projects
   
   # Clone the repository or extract the ZIP file
   git clone <repository-url>
   cd tmt-translator-extension
   ```

2. **Add Your API Key**
   - Open `src/scripts/config.js`
   - Find this line:
     ```javascript
     API_KEY: 'team_xxxxxxxxxxxxxxxx',
     ```
   - Replace with your actual API key from hackathon registration:
     ```javascript
     API_KEY: 'team_YOUR_ACTUAL_KEY_HERE',
     ```
   - Save the file

3. **Load Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (top-right toggle)
   - Click **Load unpacked**
   - Navigate to and select the `tmt-translator-extension` folder
   - The extension should appear in your extensions list

4. **Verify Installation**
   - Look for the extension icon in your Chrome toolbar
   - Click it to open the popup
   - You should see the language selection interface

## 💻 Usage

### Basic Translation

1. **Navigate to any website** (e.g., English content)
2. **Click the extension icon** in the toolbar
3. **Select languages** (default: English → Nepali)
4. **Click "🚀 Translate Page"**
5. **Wait for translation** - Progress indicator shows translation status
6. **View translated content** - Elements are marked with green left border

### Swap Languages

- Click the **⇄** button to quickly swap source and target languages
- Useful for translating content in the opposite direction

### Reset to Original

- Click **↺ Reset** to revert the page to original content
- Original text is stored for quick restoration

### Clear Cache

1. Click the extension icon
2. Expand **⚙️ Settings**
3. Click **Clear Cache** to remove cached translations
4. Cache is automatically cleared periodically (default: 60 minutes)

## 🔑 API Key Setup

### Getting Your API Key

1. Register for the Google TMT Hackathon 2026
2. Upon successful registration, you'll receive API credentials
3. API key will be shared via WhatsApp/Discord group

### Securing Your API Key

**⚠️ Important Security Notes:**

- Never commit your actual API key to public repositories
- Always use placeholder (`team_xxxxxxxxxxxxxxxx`) for sharing code
- For production, consider using environment variables:
  ```javascript
  const API_KEY = process.env.TMT_API_KEY || 'team_xxxxxxxxxxxxxxxx';
  ```
- For Chrome Web Store submission, use secure backend proxy

## 🛠️ Configuration

### Customizing Settings

Edit `src/scripts/config.js` to customize:

```javascript
// Batch size for element processing
UI: {
  MAX_ELEMENTS_PER_BATCH: 100  // Default: 100
}

// Cache expiry time (in minutes)
TRANSLATION: {
  CACHE_EXPIRY: 60  // Default: 60 minutes
}

// Delay between API calls (in milliseconds)
TRANSLATION: {
  DELAY_BETWEEN_CALLS: 300  // Default: 300ms
}

// Elements to translate
SELECTORS_TO_TRANSLATE: [
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'span', 'div', 'li', 'td', 'th', 'a', 'button'
]

// Elements to skip (do not translate)
SELECTORS_TO_SKIP: [
  'script', 'style', 'code', 'pre',
  '.no-translate', '[data-no-translate]'
]
```

### Skip Translation on Specific Pages

Add the `data-no-translate` attribute to any element:
```html
<div data-no-translate>
  This content will not be translated
</div>
```

Or add `.no-translate` class:
```html
<div class="no-translate">
  This content will not be translated
</div>
```

## 🐛 Troubleshooting

### Issue: "Invalid API token" Error
- **Solution**: Verify API key is correctly entered in `config.js`
- Check that the key hasn't expired
- Ensure Bearer token format is correct

### Issue: Extension not translating
- **Solution**: Check browser console for errors
  - Right-click page → Inspect → Console tab
  - Look for red error messages
- Verify the page is not a restricted page (e.g., chrome://, about:)
- Try reloading the extension: go to `chrome://extensions`, click Reload

### Issue: Slow translations
- **Solution**: 
  - Check internet connection
  - Reduce `MAX_ELEMENTS_PER_BATCH` in config
  - Clear cache and try again
  - API might be under load - try again later

### Issue: Some text not translating
- **Solution**:
  - Text might be in images (extension translates text only)
  - Text might be in canvas or WebGL (not supported)
  - Use browser's built-in translation as fallback
  - Some elements might be in `SELECTORS_TO_SKIP`

### Issue: Extension not showing up
- **Solution**:
  - Verify extension is enabled in `chrome://extensions`
  - Try clicking the extension icon
  - If icon not visible, click Extensions menu → find extension
  - Ensure you're on a regular webpage (not restricted page)

## 📊 Monitoring & Debugging

### View Console Logs

1. **For Service Worker (Background)**:
   - Go to `chrome://extensions/`
   - Find extension and click "Service Worker"
   - Console opens with background logs

2. **For Content Script**:
   - Right-click webpage → Inspect
   - Go to Console tab
   - Look for logs starting with `[Content Script]`

3. **For Popup Logs**:
   - Right-click extension icon → Inspect popup
   - Look for logs starting with `[Popup]`

### Monitor Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Translate a page
4. Look for requests to `https://tmt.ilprl.ku.edu.np/lang-translate`
5. Inspect request/response to debug API issues

## 📝 Detailed Documentation

For in-depth understanding of the extension architecture, data flow, and technical decisions, refer to **[LOGIC_EXPLANATION.md](./LOGIC_EXPLANATION.md)**.

Topics covered:
- Complete architecture diagram
- Component responsibilities
- Message passing flow
- Caching mechanism
- Element selection strategy
- API communication format
- Error handling approach
- Performance optimization
- Security considerations

## 🎯 Hackathon Submission Checklist

- [x] Source code in GitHub with commit history
- [x] Executable/deployable build in this directory
- [x] README with user guide
- [x] Detailed system architecture documentation (LOGIC_EXPLANATION.md)
- [ ] Demo video (to be added - record screen showing:
  - Extension installation
  - Language selection
  - Real-time translation
  - Reset functionality
  - Cache statistics)

## 🚀 Building & Packaging

### For Chrome Web Store (Future)

```bash
# Create a ZIP file for submission
zip -r tmt-translator-extension.zip tmt-translator-extension/

# Exclude unnecessary files
zip -r tmt-translator-extension.zip tmt-translator-extension/ \
  -x "*.git*" "*.DS_Store" "node_modules/*"
```

## 📄 License

This project is licensed under the **MIT License** as required by the Google TMT Hackathon 2026.

See LICENSE file for details.

## 🤝 Contributing

For the hackathon submission, improvements should be made through proper version control:

1. Create a new branch for each feature
2. Commit changes with clear messages
3. Update documentation accordingly
4. Test thoroughly before commit

## 📞 Support

For issues or questions:
1. Check this README's Troubleshooting section
2. Review LOGIC_EXPLANATION.md for architecture details
3. Check console logs for error messages
4. Contact hackathon organizers via WhatsApp/Discord group

## 🎓 Learning Resources

### Understanding the Extension

- [Chrome Extensions Official Docs](https://developer.chrome.com/docs/extensions/)
- [Google TMT API Documentation](https://tmt.ilprl.ku.edu.np/)
- [Web APIs Reference](https://developer.mozilla.org/en-US/docs/Web/API)

### Debugging

- [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)
- [Extension Debugging](https://developer.chrome.com/docs/extensions/mv3/service_workers/debugging/)

## 🎉 Success Criteria

The extension successfully:
- ✅ Translates web content in real-time
- ✅ Supports all 6 translation pairs
- ✅ Handles layout preservation
- ✅ Implements intelligent caching
- ✅ Provides user-friendly interface
- ✅ Includes comprehensive documentation
- ✅ Follows best practices

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Hackathon**: Google TMT Hackathon 2026  
**Status**: Ready for Submission
