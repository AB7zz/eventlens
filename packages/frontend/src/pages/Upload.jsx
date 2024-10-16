import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const Upload = () => {
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCode, setQRCode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [folderName, setFolderName] = useState('');

  // useEffect(() => {
  //   const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
  //   setFolderName(randomString);
  // }, []);

  const onDrop = useCallback((acceptedFiles) => {
    setImages((prevImages) => [
      ...prevImages,
      ...acceptedFiles.map((file) => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*', multiple: true });

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setUploadError(null);
    setUploadProgress(0);

    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    formData.append('folderName', folderName);

    console.log(formData)

    try {
      const response = await axios.post('http://localhost:5000/upload_images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      console.log(response.data.message);
      startProgressAnimation();
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Failed to upload images. Please try again.');
      setIsSubmitting(false);
    }
  };

  const startProgressAnimation = () => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setQRCode(true);
          }, 1000);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 50);
  };

  const [copied, setCopied] = useState(false);

  const link = `http://localhost:5173/facescan/${folderName}`;
  const copyToClipboard = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {!qrCode && images.length > 0 && (
        <>
          <input onChange={(e) => setFolderName(e.target.value)} placeholder="Enter folder name" className="absolute z-[101] top-4 left-4 bg-white p-2 rounded" />
          <button
            onClick={handleSubmit}
            className="absolute z-[101] top-4 right-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Uploading...' : 'Submit for analyzing'}
          </button>
        </>
      )}

      <div className={`transition-transform duration-500 ease-in-out transform ${isSubmitting ? '-translate-x-full' : 'translate-x-0'}`}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer w-80">
            <input {...getInputProps()} />
            {
              isDragActive ?
                <p>Drop the images here ...</p> :
                <p>Drag 'n' drop some images here, or click to select images</p>
            }
          </div>
          <div className="flex flex-wrap justify-center mt-4">
            {images.map((image, index) => (
              <div key={image.name} className="relative m-2">
                <img src={image.preview} alt={image.name} className="w-44 h-44 object-cover rounded" />
                <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800">
                  ×
                </button>l
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isSubmitting & !qrCode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="w-64 h-64 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            ></circle>
            <circle
              className="text-purple-600 progress-ring__circle stroke-current"
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 * (1 - progress / 100)}
            ></circle>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{Math.round(isSubmitting ? uploadProgress : progress)}%</span>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded">
          {uploadError}
        </div>
      )}

      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${qrCode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

        <div
          className='bg-purple-500 text-white signika px-5 py-2 rounded flex items-center cursor-pointer'
          onClick={copyToClipboard}
        >
          <span className="mr-2">{link}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        {copied && <span className="ml-2 text-green-500">Copied!</span>}

        <div className="bg-white p-8 rounded-lg">
          <img src="/qrcode.webp" alt="QR Code" className="w-80 h-80" />
        </div>
      </div>
    </div>
  );
};

export default Upload;