# Tamang Translation Fix Summary

## Problem
When translating English to Tamang, the extension was throwing an error:
```
API error response: text, src_lang and tgt_lang are all required
```

## Root Cause
The API was rejecting requests when the language code for Tamang was not recognized. The original config had:
- `'tmg': 'tam'` - Mapping Tamang (tmg) to 'tam', which might not be supported by the API

## Solution Implemented

### 1. Updated Language Code Mapping (`config.js`)
**Change:** Changed the primary Tamang language code from 'tam' to 'tmg'
```javascript
// Before
'tmg': 'tam',    // Tamang - try 'tam' if 'tmg' fails

// After  
'tmg': 'tmg',    // Tamang - try 'tmg' first
'tam': 'tmg',    // Tamang alternative mapped to tmg
```

### 2. Enhanced Error Handling (`translation-service.js`)
**Changes:** Improved the retry logic to intelligently handle Tamang language code failures:

- Added tracking of the last error for better error reporting
- When translating to Tamang, if the API returns an error about:
  - Language-related issues (`tgt_lang` in error message)
  - Language support (`language` in error message)  
  - Required fields (`required` in error message)
  
  The system will automatically try alternative Tamang codes in this order:
  1. First attempt: `tmg` (primary)
  2. On failure: Try `tam` (alternative)
  3. On failure: Try `tag` (alternative)
  4. On failure: Try `tg` (alternative)

- Added specific error logging for each alternative attempt

## How It Works
1. **First Attempt:** Tries to translate using 'tmg'
2. **If API rejects with language error:** Automatically tries 'tam'
3. **If still fails:** Tries 'tag'
4. **If still fails:** Tries 'tg'
5. **All alternatives exhausted:** Returns the last error with full context

## Testing
To verify the fix works:
1. Clear any existing translations/cache
2. Try translating English to Tamang
3. Check browser console for the translation attempt and which language code succeeded
4. You should see messages like: "Trying alternative Tamang code: tam"

## Files Modified
- `src/scripts/config.js` - Updated API_LANGUAGE_CODES mapping
- `src/scripts/translation-service.js` - Enhanced error handling and retry logic
