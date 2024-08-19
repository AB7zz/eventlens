import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const FaceCapture = () => {
  const webcamRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const capture = React.useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setIsDetecting(true);

      // Display detecting animation for 5 seconds
      const timeoutId = setTimeout(() => {
        setIsDetecting(false);
      }, 5000);

      try {
        const response = await axios.post('YOUR_API_ENDPOINT', { image: imageSrc });
        console.log(response.data);
        // If the response is good, clear the timeout
        clearTimeout(timeoutId);
        setIsDetecting(false);
      } catch (error) {
        console.error('Error sending image to API:', error);
        // In case of error, also clear the timeout
        clearTimeout(timeoutId);
        setIsDetecting(true);
      }
    }
  }, [webcamRef]);

  return (
    <div className="relative flex justify-center items-center w-full h-screen">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        className="w-4/6 h-4/6 object-cover "
      />
      {isDetecting && (
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="relative flex flex-col justify-center h-4/6 items-center w-4/6">
            <div className="absolute w-1/3 h-5/6 border-red-500 border-[5px] bg-red-100 opacity-5 rounded-full animate-pulse"></div>
            <p className="text-white text-xl ">Place your face inside...</p>
          </div>
        </div>
      )}
      <button
        onClick={capture}
        className="absolute bottom-10 px-8 py-2  bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none"
      >
        Capture
      </button>
    </div>
  );
};

export default FaceCapture;
