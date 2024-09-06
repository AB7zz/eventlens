import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api/dist/face-api.esm.js';

const FaceCapture = () => {
  const webcamRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        setModelLoaded(true);
        console.log("Loaded model");
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
      } else {
        console.log("No face detected");
        setFaceDetected(false);
      }
    }
  };

  return (
    <div className="relative flex justify-center items-center w-full h-screen">
      {modelLoaded ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            className="w-4/6 h-4/6 object-cover"
          />
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="relative flex flex-col justify-center h-4/6 items-center w-4/6">
              <div
                className={`absolute w-1/3 h-5/6 border-[5px] ${
                  faceDetected
                    ? 'bg-green-100 border-green-500'
                    : 'bg-red-100 border-red-500'
                } opacity-5 rounded-full animate-pulse`}
              ></div>
              <p className="text-white text-xl">Place your face inside...</p>
            </div>
          </div>
          {faceDetected && (
            <button
              className="absolute bottom-10 px-8 py-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
              onClick={() => alert('Continue button clicked')}
            >
              Continue
            </button>
          )}
        </>
      ) : (
        <p className="text-white text-xl">Loading models...</p>
      )}
    </div>
  );
};

export default FaceCapture;
