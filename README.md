# EventLens

**An AI-powered photo discovery platform that helps event attendees instantly find their photos.**

EventLens revolutionizes event photography by using deep learning face recognition to match attendees with their photos. Photographers upload event photos, generate a shareable link, and attendees simply scan their face to instantly receive all photos they appear in - no more scrolling through hundreds of images!

🔗 **Live Demo:** [eventlens.netlify.app](https://eventlens.netlify.app/)

---

## Overview

EventLens implements a sophisticated hybrid machine learning architecture that processes faces both client-side and server-side for optimal performance and accuracy. Photographers upload event photos to the platform, which automatically extracts and stores face embeddings. Attendees visit the event link, scan their face via webcam, and the system instantly identifies and delivers all matching photos through an intuitive interface or via Telegram.

## Key Features

- **Photographer Upload**: Bulk upload event photos and generate shareable event links
- **Face Scan Search**: Attendees scan their face via webcam to find their photos instantly
- **Real-Time Detection**: Browser-based face capture using TensorFlow.js and Face-api.js
- **Deep Learning Matching**: FaceNet (InceptionResnetV1) extracts 128-dimensional embeddings for accurate photo matching
- **Smart Recognition**: Cosine similarity-based matching with 0.6 threshold for reliable results
- **GPU Acceleration**: PyTorch-powered inference with CUDA support for fast processing
- **Cloud Storage**: Firebase Storage integration for scalable image and embedding management
- **Telegram Delivery**: Optional bot integration to send matched photos directly to attendees
- **Modern UI**: Responsive React-based frontend with intuitive photo gallery

## Technology Stack

### Frontend
- **React** - UI framework
- **TensorFlow.js** - Browser-based machine learning
- **Face-api.js** - Real-time face detection (SSD MobileNetV1)
- **Vite** - Build tool and dev server

### Backend
- **Flask** - Python web framework
- **PyTorch** - Deep learning framework
- **FaceNet-PyTorch** - Face recognition models
  - `InceptionResnetV1` (pre-trained on VGGFace2) - 128-dimensional face embeddings
  - `MTCNN` - Multi-task Cascaded Convolutional Networks for face detection
- **OpenCV** - Computer vision and image processing
- **NumPy** - Numerical computations and similarity calculations

### Infrastructure
- **Firebase Storage** - Cloud storage for images and embeddings
- **Telegram Bot API** - Notification delivery
- **Netlify** - Frontend hosting

## How It Works

### For Photographers:
1. **Upload Photos**: Bulk upload event photos to the platform
2. **Face Extraction**: System automatically detects faces in all uploaded photos using MTCNN
3. **Embedding Generation**: InceptionResnetV1 generates 128-dimensional embeddings for each detected face
4. **Storage**: Photos and embeddings stored in Firebase Storage
5. **Share Link**: Unique event link generated and shared with all attendees

### For Attendees:
1. **Visit Event Link**: Open the photographer's shared event link
2. **Face Scan**: Allow webcam access; TensorFlow.js detects face in real-time (0.8 confidence threshold)
3. **Upload**: Captured face image (Base64) sent to Flask backend API
4. **Matching**: Cosine similarity computed between attendee's face and all stored photo embeddings
5. **Results**: All photos with matching faces (similarity ≥ 0.6) returned instantly
6. **Download/Share**: View matched photos in grid format, download, or receive via Telegram bot

## Architecture

```
PHOTOGRAPHER WORKFLOW:
┌──────────────────┐
│ Upload Event     │
│ Photos (Bulk)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Flask Backend    │
│ Face Detection   │
│ (MTCNN)          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ FaceNet Model    │
│ Extract Embeddings
│ (InceptionResnet)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Firebase Storage │
│ Store Photos +   │
│ Embeddings       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Generate Event   │
│ Shareable Link   │
└──────────────────┘

ATTENDEE WORKFLOW:
┌──────────────────┐
│ Visit Event Link │
│ Scan Face        │
│ (TensorFlow.js)  │
└────────┬─────────┘
         │ Base64 Image
         ▼
┌──────────────────┐
│ Flask Backend    │
│ Extract Face     │
│ Embedding        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Cosine Similarity│
│ Match Against    │
│ Event Photos     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Return Matched   │
│ Photos + Option  │
│ Telegram Delivery│
└──────────────────┘
```

## Machine Learning Models

### Frontend: SSD MobileNetV1
- Lightweight convolutional neural network optimized for speed
- Real-time face detection in the browser
- Quantized weights (uint8) for efficient inference
- Multi-scale detection with confidence filtering

### Backend: FaceNet (InceptionResnetV1)
- State-of-the-art face recognition architecture
- Pre-trained on VGGFace2 dataset (3.31M images, 9131 subjects)
- Generates discriminative 128-dimensional embeddings
- Optimized for face verification and identification tasks

### Detection: MTCNN
- Multi-stage cascaded architecture
- Simultaneous face detection and facial landmark localization
- Robust to various face orientations and lighting conditions

## Project Structure

```
eventlens/
├── packages/
│   ├── frontend/          # React + TensorFlow.js application
│   │   ├── src/
│   │   │   └── pages/
│   │   │       └── FaceScan.jsx    # Main face capture component
│   │   └── public/
│   │       └── models/             # Pre-trained ML models
│   └── backend/           # Flask + PyTorch API
│       ├── app.py         # Main API endpoints
│       └── bot.py         # Telegram bot handler
└── README.md
```

## Performance

- **Face Detection**: ~30-60 FPS (browser-dependent)
- **Embedding Extraction**: GPU-accelerated inference
- **Matching Speed**: Scales with number of stored embeddings
- **Accuracy**: Dependent on image quality and VGGFace2 pre-training

## Use Cases

- **Wedding Photography**: Guests scan their face to instantly receive all their wedding photos
- **Conference & Corporate Events**: Attendees find professional photos from networking sessions and presentations
- **Sports Events**: Participants discover action shots featuring themselves
- **School Events**: Parents/students find photos from graduations, sports days, and school functions
- **Party Photography**: Event-goers retrieve their photos without scrolling through hundreds of images
- **Professional Photoshoots**: Group events where individuals want only their specific photos

## Future Enhancements

- **Multi-face Detection**: Support finding photos with multiple people (e.g., "find photos with me and my friends")
- **Enhanced Matching**: Implement triplet loss and ArcFace for improved accuracy
- **Photo Filters**: Allow photographers to organize photos by sessions, locations, or time
- **Analytics Dashboard**: Provide photographers insights on photo views and downloads
- **Mobile App**: Native iOS/Android apps for easier photo access
- **Payment Integration**: Enable paid photo downloads for professional photographers
- **Album Creation**: Auto-generate personalized photo albums for attendees

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is available for educational and portfolio purposes.

---

**Built with deep learning and modern web technologies to make event photography effortless.**
