"use client"
import React, { useState } from 'react';
import './input.css';

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [bgRemovedImageUrl, setBgRemovedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const resizeImage = (imageFile, maxWidth, maxHeight) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      let newWidth = width;
      let newHeight = height;
      if (width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (height * maxWidth) / width;
      }
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = (width * maxHeight) / height;
      }
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      canvas.toBlob(resolve, 'image/jpeg');
    };
    img.src = URL.createObjectURL(imageFile);
  });
  
  const handleRemoveBackground = async () => {
    if (!selectedFile) return;
    try {
      setLoading(true);
      const resizedImage = await resizeImage(selectedFile, selectedFile.width, selectedFile.height);
      const formData = new FormData();
      formData.append('image_file', resizedImage, selectedFile.name);
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'fE7ByAj3rsC9MnuigmwGyuJ1',
        },
        body: formData,
      });
      if (!response.ok) {
        console.error('Error removing background:', response.statusText);
        return;
      }
      const result = await response.blob();
      setBgRemovedImageUrl(URL.createObjectURL(result));
    } catch (error) {
      console.error('Error removing background:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = bgRemovedImageUrl;
    downloadLink.download = 'background_removed_image.jpg';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setImageUrl(null);
    setBgRemovedImageUrl(null);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 px-6 py-12 md:px-12 lg:px-24">
      <header className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl text-white font-bold mb-4">Background Remover Tool</h1>
        <p className="text-lg text-gray-300">Enhance your images by removing backgrounds</p>
      </header>
      
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-xl lg:text-2xl font-semibold mb-4">Select a photo:</h2>
        <input type="file" className="py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-400 mb-6" onChange={handleFileChange} />
        {selectedFile && (
          <div className='flex items-center space-x-8 mb-8'>
            <div className='w-1/2'>
              <h3 className="text-lg lg:text-xl font-semibold mb-4">Selected Photo:</h3>
              <img src={imageUrl} alt="Selected" className="w-full h-auto rounded-lg shadow-lg mb-4" />
              <button onClick={handleRemoveBackground} className="py-3 px-6 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Remove BG</button>
              {loading && <div className="mt-4 text-gray-600">Loading...</div>}
            </div>
            {bgRemovedImageUrl && (
              <>
                <hr className="my-8 lg:hidden" />
                <div className='w-1/2'>
                  <h3 className="text-lg lg:text-xl font-semibold mb-4">Background Removed:</h3>
                  <img src={bgRemovedImageUrl} alt="Background Removed" className="w-full h-auto rounded-lg shadow-lg mb-4" />
                  <button onClick={handleDownload} className="py-3 px-6 bg-blue-500 text-white rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:bg-green-600">Download Image</button>
                </div>
              </>
            )}
          </div>
        )}
        {selectedFile && (
          <div className="text-center">
            <button onClick={handleClear} className="py-3 px-6 bg-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400">Clear</button>
          </div>
        )}
      </div>

      <footer className="text-center mt-12 text-gray-300">
        <p className="text-sm">&copy; {new Date().getFullYear()} Your Company. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
