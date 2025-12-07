# EventLens

**An intelligent face recognition platform for automated event attendee identification and matching.**

EventLens is a full-stack application that leverages deep learning to streamline attendee tracking at events. By combining real-time face detection with powerful neural network-based matching, EventLens enables instant identification of participants and automatic notification delivery.

🔗 **Live Demo:** [eventlens.netlify.app](https://eventlens.netlify.app/)

---

## Overview

EventLens implements a sophisticated hybrid machine learning architecture that processes faces both client-side and server-side for optimal performance and accuracy. Users can capture their face via webcam, and the system automatically matches against a database of registered attendees, delivering results through Telegram integration.

## Key Features

- **Real-Time Face Detection**: Browser-based face capture using TensorFlow.js and Face-api.js
- **Deep Learning Recognition**: Server-side face embedding extraction using FaceNet (InceptionResnetV1)
- **Accurate Matching**: Cosine similarity-based matching with 0.6 threshold for reliable identification
- **GPU Acceleration**: PyTorch-powered inference with CUDA support for fast processing
- **Cloud Storage**: Firebase Storage integration for scalable image and embedding management
- **Instant Notifications**: Telegram bot integration for asynchronous result delivery
- **Modern UI**: Responsive React-based frontend with real-time webcam feed

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

1. **Face Capture**: User allows webcam access; TensorFlow.js detects faces in real-time with 0.8 confidence threshold
2. **Image Upload**: Captured face image (Base64) sent to Flask backend API
3. **Face Detection**: MTCNN detects and extracts faces from the uploaded image
4. **Embedding Extraction**: InceptionResnetV1 generates 128-dimensional face embeddings
5. **Similarity Matching**: Cosine similarity computed against stored embeddings in Firebase
6. **Result Delivery**: Matching faces (similarity ≥ 0.6) returned and optionally sent via Telegram
7. **Display**: Results presented in an organized grid format on the frontend

## Architecture

```
┌─────────────────┐
│  React Frontend │
│  (TensorFlow.js)│
│  Face Detection │
└────────┬────────┘
         │ Base64 Image
         ▼
┌─────────────────┐
│  Flask Backend  │
│  (PyTorch GPU)  │
│  FaceNet Model  │
└────────┬────────┘
         │ Embeddings
         ▼
┌─────────────────┐
│ Firebase Storage│
│ Cosine Similarity
│    Matching     │
└────────┬────────┘
         │ Matches
         ▼
┌─────────────────┐
│  Telegram Bot   │
│ Result Delivery │
└─────────────────┘
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

- Event check-ins and attendee tracking
- Conference registration and networking
- Security and access control
- Automated photo organization
- Group event photo matching

## Future Enhancements

- Multi-face detection and batch processing
- Enhanced matching algorithms (triplet loss, ArcFace)
- Real-time video stream processing
- Advanced analytics and attendance reports
- Mobile application development

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is available for educational and portfolio purposes.

---

**Built with deep learning and modern web technologies to make event management smarter.**
