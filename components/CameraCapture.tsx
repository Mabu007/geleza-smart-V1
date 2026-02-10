import React, { useRef } from 'react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onCapture(base64String);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment" // This triggers the rear camera on mobile
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-3 bg-fun-teal text-white rounded-full hover:bg-teal-500 transition-colors shadow-lg"
        title="Snap Homework"
      >
        <i className="fas fa-camera text-xl"></i>
      </button>
    </>
  );
};

export default CameraCapture;