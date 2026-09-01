# 🤖 AI Image Chatbot

A powerful, modern web-based chatbot that can analyze images and answer questions just like Gemini or Claude. Built with vanilla JavaScript, HTML, and CSS.

## Features

✨ **Image Analysis** - Upload and analyze multiple images at once
🧠 **AI-Powered** - Choose between Google Gemini or Anthropic Claude
💬 **Conversational** - Natural chat interface with message history
🎨 **Beautiful UI** - Modern gradient design with smooth animations
📱 **Responsive** - Works on desktop, tablet, and mobile devices
🔒 **Secure** - API keys stored locally in browser storage
⚡ **Fast** - Real-time responses from AI models

## Getting Started

### Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge)
- API key from either:
  - [Google Gemini](https://makersuite.google.com/app/apikey)
  - [Anthropic Claude](https://console.anthropic.com/)

### Installation

1. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/caddac2026/ai-image-chatbot.git
   cd ai-image-chatbot
   ```

2. **Open in Browser**
   - Simply open `index.html` in your web browser
   - Or use a local server for best results:
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js (with http-server)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```
   - Then navigate to `http://localhost:8000`

### Getting API Keys

#### Google Gemini
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

#### Anthropic Claude
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy your API key

## Usage

1. **Start the App**
   - Open `index.html` in your browser

2. **Configure API**
   - Select your AI provider (Gemini or Claude)
   - Paste your API key
   - Click "Save Configuration"

3. **Use the Chatbot**
   - Type your question in the message box
   - Click "📷 Add Images" to upload images (optional)
   - Click "Send" or press Shift+Enter
   - Wait for the AI response

4. **Manage Images**
   - Click "📷 Add Images" to select one or multiple images
   - Preview images appear below the file input
   - Click the "×" button on any preview to remove it
   - Images are sent with your message

5. **Clear & Logout**
   - "Clear Chat" - Clears conversation history
   - "Logout" - Clears API key and returns to setup

## How It Works

### Architecture

```
index.html (UI Structure)
    ↓
styles.css (Styling & Animations)
    ↓
config.js (Configuration Management)
    ↓
api.js (AI API Integration)
    ↓
app.js (Main Application Logic)
```

### Data Flow

1. **User Input** → User enters message and/or selects images
2. **Image Processing** → Images converted to base64 format
3. **API Request** → Message and images sent to selected AI provider
4. **AI Response** → AI analyzes and generates response
5. **Display** → Response shown in chat interface with images

### Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)
- BMP (.bmp)

## File Structure

```
ai-image-chatbot/
├── index.html      # Main HTML interface
├── styles.css      # Styling and animations
├── config.js       # Configuration management
├── api.js          # AI API integration
├── app.js          # Main application logic
└── README.md       # This file
```

## Configuration Details

### Local Storage

The app stores the following in browser's local storage:
- `aiProvider` - Selected AI provider (gemini or claude)
- `apiKey` - Your API key (encrypted would be safer in production)

### API Endpoints

**Google Gemini:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

**Anthropic Claude:**
```
POST https://api.anthropic.com/v1/messages
```

## Customization

### Change AI Models

Edit `api.js` to use different models:

**For Gemini** (line 44):
```javascript
// Change this:
gemini-1.5-flash

// To any of:
gemini-pro
gemini-1.5-pro
```

**For Claude** (line 77):
```javascript
// Change this:
claude-3-5-sonnet-20241022

// To any of:
claude-3-opus-20240229
claude-3-sonnet-20240229
claude-3-haiku-20240307
```

### Modify UI Colors

Edit `styles.css` to change the gradient colors:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Adjust Max Image Size

In `app.js`, modify the preview container max-height:
```css
.preview-container {
    max-height: 150px; /* Change this value */
}
```

## Limitations & Notes

⚠️ **Important Considerations:**

1. **API Keys** are stored in browser's local storage (not encrypted)
   - For production, implement secure backend authentication
   - Never commit API keys to version control

2. **CORS Issues** - Some browsers may have CORS restrictions
   - Use a proxy or backend server in production
   - Test on a local server for best results

3. **Image Size** - Large images may take longer to process
   - Recommended max size: 20MB
   - Optimal size: 1-5MB

4. **API Rate Limits** - Each provider has rate limits
   - Gemini: Check [pricing](https://ai.google.dev/pricing)
   - Claude: Check [pricing](https://www.anthropic.com/pricing/claude)

5. **Free Tier** - Both providers offer free tier with limits
   - Gemini: 60 requests per minute (free tier)
   - Claude: Limited free credits per month

## Troubleshooting

### "Invalid API Key" Error
- Double-check your API key is correct
- Make sure you copied the entire key
- Verify the API is enabled in your provider's console
- Try creating a new API key

### Images Not Uploading
- Check browser console for errors (F12)
- Ensure images are in supported formats
- Try smaller image files
- Clear browser cache and refresh

### No Response from AI
- Check your internet connection
- Verify API key is valid
- Check provider's API status
- Wait a moment and try again
- Check rate limits haven't been exceeded

### CORS Error
- Use a local server instead of `file://` protocol
- Consider implementing a backend proxy
- Check browser console for specific error details

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Older browsers may not work

## Privacy & Security

- API keys are stored in browser's local storage
- Messages and images are sent to AI provider's servers
- No data is stored on this application's servers
- Review privacy policies of your chosen AI provider
- For sensitive data, use a private/self-hosted solution

## Performance Tips

1. **Optimize Images** - Compress before uploading
2. **Use Efficient Queries** - Be specific in questions
3. **Clear Chat Regularly** - Keep conversation focused
4. **Use Appropriate Provider** - Gemini for speed, Claude for accuracy
5. **Manage Images** - Remove unnecessary images

## Future Enhancements

- 🔐 Encrypted API key storage
- 💾 Conversation history export
- 🎤 Voice input support
- 📊 Multiple conversation threads
- 🌙 Dark/Light theme toggle
- 🔄 Streaming responses
- 📎 Document upload support
- 🌍 Multi-language support

## Contributing

Feel free to fork, modify, and improve this project!

Suggestions:
- Add new AI providers
- Improve UI/UX
- Add more features
- Fix bugs
- Optimize performance

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Disclaimer

This project is not affiliated with Google, Anthropic, or any AI provider. Use at your own risk and ensure compliance with each provider's terms of service.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check browser console for errors
4. Open an issue on GitHub

## Credits

Built with ❤️ using vanilla JavaScript, HTML, and CSS.

---

**Happy chatting! 🚀**

For the latest updates, visit: [GitHub Repository](https://github.com/caddac2026/ai-image-chatbot)
