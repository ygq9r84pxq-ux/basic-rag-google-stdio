
import React, { useRef, useState } from 'react';
import { FileData } from '../types';

interface FileUploaderProps {
  onFileSelect: (file: FileData) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onFileSelect({
        name: file.name,
        base64,
        mimeType: file.type,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center ${
        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isLoading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onInputChange}
        className="hidden"
        accept="application/pdf"
        disabled={isLoading}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
          <i className="fa-solid fa-file-pdf text-3xl"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Upload your PDF</h3>
          <p className="text-sm text-gray-500 mt-1">Drag and drop or click to browse</p>
        </div>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">MAX 20MB</p>
      </div>
    </div>
  );
};

export default FileUploader;
