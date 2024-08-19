import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const Upload = () => {
  const [images, setImages] = useState([]);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div {...getRootProps()} className="border-2 border-dashed border-purple-900 rounded-lg p-8 text-center cursor-pointer mx-auto w-80">
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
            <img src={image.preview} alt={image.name} className="w-40 h-40 object-cover rounded" />
            <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Upload;