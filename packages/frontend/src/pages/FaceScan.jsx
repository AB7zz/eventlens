import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api/dist/face-api.esm.js';
import axios from 'axios';
import { FaCamera } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

const FaceCapture = () => {
  const { id: folderName } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [similarFaces, setSimilarFaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null); // State to store the captured image
  const [showModal, setShowModal] = useState(false); // For showing the modal
  const [telegramID, setTelegramID] = useState(''); // To store Telegram ID
  const [isApiDisabled, setIsApiDisabled] = useState(true); // To disable API button until Telegram ID is provided

  useEffect(() => {
    // Load face detection model
    const loadModels = async () => {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        setModelLoaded(true);
      } catch (error) {
        console.error("Error loading model", error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (modelLoaded) {
      const intervalId = setInterval(() => {
        captureAndDetect();
      }, 2000); // Capture and detect every 2 seconds

      return () => clearInterval(intervalId); // Clean up the interval on component unmount
    }
  }, [modelLoaded]);

  const captureAndDetect = async () => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const image = webcamRef.current.getScreenshot();
      const img = await faceapi.fetchImage(image);

      const detection = await faceapi.detectSingleFace(img);
      if (detection && detection._score > 0.8) {
        console.log("Face detected:", detection);
        setFaceDetected(true);
        setCapturedImage(image); // Save the captured image in the state
      } else {
        console.log("No face detected");
        setFaceDetected(false);
      }
    }
  };

  const handleCaptureClick = () => {
    setCaptureComplete(true);
    setShowModal(true); // Open the modal after capture
  };

  const handleSendImages = async () => {
    setIsLoading(true);
    if (capturedImage) {
      const payload = {
        image: capturedImage, // The base64 image string
        folderName: folderName,
        telegramID: telegramID // The Telegram ID
      };

      console.log(payload, "formdata");

      try {
        const response = await axios.post('http://localhost:5000/find_similar_faces', payload, {
          headers: { 
            "Content-Type": "application/json" ,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"}
        });
        console.log("face scan post ay");
        setSimilarFaces(response.data.similar_images);
      } catch (error) {
        console.error('Error finding similar faces:', error);
      } finally {
        setIsLoading(false);
        setShowModal(false); // Close the modal
      }
    }
  };

  const handleRetry = () => {
    navigate(`/facescan/${folderName}`);
    setCaptureComplete(false);
    setSimilarFaces([]);
  };

  const handleTelegramIDChange = (e) => {
    setTelegramID(e.target.value);
    setIsApiDisabled(e.target.value.trim() === ""); // Disable button if Telegram ID is empty
  };

  // Download handler
  const handleDownload = (event, index) => {
    event.preventDefault();
    const face = similarFaces[index];

    // Create a blob from the base64 data
    const base64Image = face.image;
    const blob = new Blob([Uint8Array.from(atob(base64Image), c => c.charCodeAt(0))], { type: 'image/jpeg' });

    // Create a link to download the blob
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `similar_face_${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative flex flex-col justify-center items-center w-full min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Face Recognition</h1>
      {!modelLoaded ? (
        <div className="flex flex-col items-center">
          <ClipLoader color="#4A90E2" size={50} />
          <p className="mt-4 text-xl text-gray-600">Loading face detection model...</p>
        </div>
      ) : !captureComplete ? (
        <div className="relative w-full max-w-2xl">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-auto rounded-lg shadow-lg"
          />
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className={`w-64 h-64 border-4 rounded-full ${faceDetected ? 'border-green-500' : 'border-red-500'} transition-colors duration-300`}></div>
          </div>
          <p className="mt-4 text-center text-xl text-gray-700">
            {faceDetected ? "Face detected! Click 'Capture' when ready." : "Position your face in the circle..."}
          </p>
          {faceDetected && (
            <button
              className="mt-6 px-8 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none flex items-center justify-center w-full max-w-xs mx-auto transition-colors duration-300"
              onClick={handleCaptureClick}
            >
              <FaCamera className="mr-2" />
              Capture
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Modal for Telegram ID input */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Send Photos via Telegram</h2>
                <p className="mb-4">Enter your Telegram ID to receive the photos via WhatsApp bot:</p>
                <input
                  type="text"
                  placeholder="Enter Telegram ID"
                  value={telegramID}
                  onChange={handleTelegramIDChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                />
                <div className='flex flex-col justify-center gap-2 items-center'>
                <button
                  onClick={handleSendImages}
                  disabled={isApiDisabled}
                  className={`w-full px-4 py-2 h-14  bg-blue-800 text-white rounded-lg hover:bg-blue-600 focus:outline-none ${isApiDisabled ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  Send Photos via telegram
                </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading or displaying similar faces */}
          {isLoading ? (
            <div className="flex flex-col items-center">
              <ClipLoader color="#4A90E2" size={50} />
              <p className="mt-4 text-xl text-gray-600">Finding similar faces...</p>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Similar Faces:</h2>
              {similarFaces.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {similarFaces.map((face, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex justify-center items-center flex-col">
                      <img src={`data:image/jpeg;base64,${face.image}`} alt={`Similar face ${index + 1}`} className="w-full h-48 object-cover" />
                      <div className="p-2">
                        <p className="text-sm font-semibold text-gray-700">Similarity: {(face.similarity * 100).toFixed(2)}%</p>
                      </div>
                      <button className='px-4 py-2 w-full text-white bg-blue-950' onClick={(event) => handleDownload(event, index)}>Download</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xl text-gray-600">No similar faces found.</p>
              )}
              <button
                className="mt-8 px-8 py-3 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-600 focus:outline-none transition-colors duration-300"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceCapture;
