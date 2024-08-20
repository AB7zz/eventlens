import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import * as faceapi from '@vladmandic/face-api/dist/face-api.esm.js'
import * as tf from '@tensorflow/tfjs'

const FaceCapture = () => {
  const webcamRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    };
    loadModels();
  }, []);

  const detect = async () => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const detection = await faceapi.detectSingleFace(video);
      if(detection && detection._score > 0.8){
        console.log(detection)
        setFaceDetected(true);
      }else{
        console.log('No face detected')
        setFaceDetected(false);
      }

    }
  };

  return (
    <div className="relative flex justify-center items-center w-full h-screen">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        className="w-4/6 h-4/6 object-cover "
      />
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="relative flex flex-col justify-center h-4/6 items-center w-4/6">
          <div className={`absolute w-1/3 h-5/6 border-[5px] ${faceDetected ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'} opacity-5 rounded-full animate-pulse`}></div>
          <p className="text-white text-xl ">Place your face inside...</p>
        </div>
      </div>
      <button
        onClick={detect}
        className="absolute bottom-10 px-8 py-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
      >
        Detect Face
      </button>
    </div>
  );
};

export default FaceCapture;
