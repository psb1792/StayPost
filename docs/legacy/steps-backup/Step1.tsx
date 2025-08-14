import React, { useState, useEffect } from 'react';
import { Upload, Image, X, Check } from 'lucide-react';
import StoreNameInput from '../StoreNameInput';

interface Step1Props {
  files: File[];
  setFiles: (files: File[]) => void;
  setPreviewUrl: (url: string | null) => void;
  next: () => void;
}

export default function Step1({ files, setFiles, setPreviewUrl, next }: Step1Props) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('');
  const [storeSlug, setStoreSlug] = useState<string>('');

  const handleStoreCreated = (store: any) => {
    setStoreId(store.id);
    setStoreName(store.store_name);
    setStoreSlug(store.slug);
  };

  // Auto-advance to next step after store creation and image upload
  useEffect(() => {
    if (storeId && files.length > 0) {
      const timer = setTimeout(() => {
        next();
      }, 1500); // 1.5초 후 자동 이동

      return () => clearTimeout(timer);
    }
  }, [storeId, files.length, next]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList);
    setFiles(arr);

    if (arr.length > 0) {
      const url = URL.createObjectURL(arr[0]);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
  };

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    
    // Update preview URL
    if (updatedFiles.length > 0) {
      const url = URL.createObjectURL(updatedFiles[0]);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Store creation not completed yet
  if (!storeId) {
    return (
      <div className="space-y-8">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">1) 가게 정보 입력</h2>
          <p className="text-gray-600">먼저 가게명을 입력하여 고유한 URL을 생성해주세요</p>
        </div>

        {/* Store Name Input Component */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <StoreNameInput onStoreCreated={handleStoreCreated} />
        </div>
        
        {/* Success Message */}
        {storeId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">가게가 성공적으로 생성되었습니다!</p>
                <p className="text-sm text-green-700">
                  {files.length > 0 
                    ? "이미지가 업로드되었습니다. 1.5초 후 자동으로 다음 단계로 이동합니다..." 
                    : "이제 이미지를 업로드해주세요."
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Store creation completed, show image upload UI
  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">1) Upload Photos</h2>
        <p className="text-gray-600">Select multiple image files to get started</p>
      </div>

      {/* Store Info Display */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 mb-1">선택된 가게</p>
            <p className="font-medium text-blue-900">{storeName}</p>
            <p className="text-xs text-blue-600">https://staypost.kr/{storeSlug}</p>
          </div>
          <button
            onClick={() => {
              setStoreId(null);
              setStoreName('');
              setStoreSlug('');
            }}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            변경하기
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="space-y-6">
        <label className="block">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  Choose image files
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
              
              <div className="text-xs text-gray-400">
                Click to browse or drag and drop
              </div>
            </div>
          </div>
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Selected Files Display */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">
              Selected Files ({files.length})
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Image className="w-5 h-5 text-blue-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-3 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-150 flex-shrink-0"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={next}
          disabled={files.length === 0}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            files.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }`}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}