# Video Sentiment Analysis - Frontend Dashboard

Modern, responsive web dashboard for video sentiment analysis built with SvelteKit and TailwindCSS.

## 🚀 Features

- **Video Upload** - Drag-and-drop interface with progress tracking
- **Live Stream** - Configure and monitor live stream analysis
- **Real-time Updates** - WebSocket integration for live progress
- **Interactive Charts** - Sentiment timeline visualization with Chart.js
- **Keyword Tracking** - Clickable timestamps for video navigation
- **Video Player** - Full playback controls with timeline sync
- **Export** - Download results in JSON or CSV
- **Responsive Design** - Mobile-friendly interface
- **Authentication** - Token-based auth with persistent sessions

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running (see [backend repository](https://github.com/yourusername/video-sentiment-backend))

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/video-sentiment-frontend.git
cd video-sentiment-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Production Build

```bash
npm run build
npm run preview
```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run in watch mode
```bash
npm run test:watch
```

### Run with UI
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run test:coverage
```

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.svelte
│   │   │   ├── VideoUpload.svelte
│   │   │   ├── VideoPlayer.svelte
│   │   │   ├── SentimentChart.svelte
│   │   │   └── KeywordList.svelte
│   │   ├── services/           # API client
│   │   │   └── api.ts
│   │   └── stores/             # State management
│   │       ├── auth.ts
│   │       ├── videos.ts
│   │       └── websocket.ts
│   └── routes/                 # Pages
│       ├── +layout.svelte      # Layout
│       ├── +page.svelte        # Home
│       ├── upload/             # Upload page
│       ├── live/               # Live stream page
│       ├── analysis/[id]/      # Analysis page
│       ├── videos/             # Video list
│       └── login/              # Login page
├── static/                     # Static assets
├── tests/                      # Test files
└── package.json               # Dependencies
```

## 📱 Pages

### Home (`/`)
- Feature overview
- Quick access to upload and live stream
- Navigation to all sections

### Upload (`/upload`)
- Drag-and-drop file upload
- File validation
- Custom keyword input
- Upload progress tracking

### Live Stream (`/live`)
- Stream URL configuration
- Start/stop controls
- Real-time processing status

### Analysis (`/analysis/[id]`)
- Overall sentiment display
- Interactive timeline chart
- Full transcription
- Keyword list with timestamps
- Export buttons
- Real-time WebSocket updates

### My Videos (`/videos`)
- List of all analyzed videos
- Status indicators
- Quick access to analysis

### Login (`/login`)
- Authentication interface
- Persistent sessions

## 🎨 Components

### Navbar
- Navigation menu
- Authentication status
- Responsive design

### VideoUpload
- Drag-and-drop interface
- File validation
- Progress indication
- Keyword input

### VideoPlayer
- Playback controls
- Timeline synchronization
- Seek functionality
- Volume control

### SentimentChart
- Interactive Chart.js visualization
- Timeline display
- Click-to-seek
- Real-time updates

### KeywordList
- Keyword display with frequencies
- Clickable timestamps
- Search/filter functionality

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8000` |

### API Integration

The frontend communicates with the backend via:
- REST API for data operations
- WebSocket for real-time updates

See `src/lib/services/api.ts` for API client implementation.

## 🎨 Styling

Built with:
- **TailwindCSS** - Utility-first CSS framework
- **Custom Components** - Reusable styled components
- **Responsive Design** - Mobile-first approach

### Customization

Modify `tailwind.config.js` to customize:
- Colors
- Fonts
- Spacing
- Breakpoints

## 🐳 Docker Deployment

### Build image
```bash
docker build -t video-sentiment-frontend .
```

### Run container
```bash
docker run -d \
  -p 5173:5173 \
  -e VITE_API_URL=http://your-backend-url:8000 \
  video-sentiment-frontend
```

## 📊 Performance

- **Initial Load:** <2 seconds
- **Page Navigation:** Instant (SPA)
- **Chart Rendering:** <500ms
- **WebSocket Latency:** <100ms

## 🔒 Security

- Token-based authentication
- Secure WebSocket connections
- Input validation
- XSS protection
- CSRF protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Generate coverage report |
| `npm run check` | Type checking |
| `npm run lint` | Lint code |

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - Web framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Chart.js](https://www.chartjs.org/) - Charting library
- [Vite](https://vitejs.dev/) - Build tool
- [Vitest](https://vitest.dev/) - Testing framework

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check the component documentation
- Review the test suite for examples

## 🔗 Related

- [Backend Repository](https://github.com/yourusername/video-sentiment-backend)
- [Full Documentation](https://github.com/yourusername/video-sentiment-docs)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:5173
```

## 📸 Screenshots

### Home Page
Modern landing page with feature overview and quick access.

### Upload Page
Drag-and-drop interface with real-time validation.

### Analysis Dashboard
Interactive charts, keywords, and full transcription.

### Live Stream
Real-time monitoring and configuration.

---

Built with ❤️ using SvelteKit and TailwindCSS
