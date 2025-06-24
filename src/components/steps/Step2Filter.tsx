import React, { useState, useEffect } from 'react';
import { Palette, RotateCcw, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react';

interface FilterOption {
  id: string;
  name: string;
  cssFilter: string;
  description: string;
}

interface Step2FilterProps {
  files: File[];
  previewUrl: string | null;
  selectedFilter: string | null;
  setSelectedFilter: (filterId: string | null) => void;
  next: () => void;
  back: () => void;
}

const filterOptions: FilterOption[] = [
  {
    id: 'none',
    name: 'Original',
    cssFilter: 'none',
    description: 'No filter applied'
  },
  {
    id: 'warm',
    name: 'Warm',
    cssFilter: 'sepia(0.3) saturate(1.2) brightness(1.1) contrast(1.1)',
    description: 'Cozy, golden tones'
  },
  {
    id: 'vivid',
    name: 'Vivid',
    cssFilter: 'saturate(1.5) contrast(1.2) brightness(1.05)',
    description: 'Enhanced colors and contrast'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    cssFilter: 'sepia(0.5) contrast(1.2) brightness(0.9) saturate(0.8)',
    description: 'Classic, aged look'
  },
  {
    id: 'cool',
    name: 'Cool',
    cssFilter: 'hue-rotate(180deg) saturate(1.1) brightness(1.05)',
    description: 'Cool blue tones'
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    cssFilter: 'contrast(1.5) brightness(0.9) saturate(1.3)',
    description: 'High contrast and drama'
  },
  {
    id: 'soft',
    name: 'Soft',
    cssFilter: 'brightness(1.1) contrast(0.9) saturate(0.9) blur(0.5px)',
    description: 'Gentle, dreamy effect'
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    cssFilter: 'grayscale(1) contrast(1.2) brightness(1.1)',
    description: 'Classic black and white'
  }
];

export default function Step2Filter({ 
  files, 
  previewUrl, 
  selectedFilter, 
  setSelectedFilter, 
  next, 
  back 
}: Step2FilterProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Set default filter to 'none' if not already set
  useEffect(() => {
    if (selectedFilter === null) {
      setSelectedFilter('none');
    }
  }, [selectedFilter, setSelectedFilter]);

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
  };

  const resetFilter = () => {
    setSelectedFilter('none');
  };

  const selectedFilterOption = filterOptions.find(f => f.id === selectedFilter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">2) Apply Visual Filter</h2>
        <p className="text-gray-600">
          Choose a filter to enhance your image's visual appeal
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Image Preview Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Image Preview
            </h3>
            
            {selectedFilter && selectedFilter !== 'none' && (
              <button
                onClick={resetFilter}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>

          {previewUrl ? (
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={previewUrl}
                alt="Preview with filter"
                onLoad={() => setImageLoaded(true)}
                className="w-full h-80 object-cover transition-all duration-500 ease-out"
                style={{ 
                  filter: selectedFilterOption?.cssFilter || 'none',
                  opacity: imageLoaded ? 1 : 0
                }}
              />
              
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading image...</span>
                  </div>
                </div>
              )}

              {/* Filter Name Overlay */}
              {selectedFilterOption && selectedFilter !== 'none' && imageLoaded && (
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">{selectedFilterOption.name}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No image available</p>
                <p className="text-gray-400 text-sm">Please go back and upload an image</p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">Choose Filter</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterSelect(filter.id)}
                className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                  selectedFilter === filter.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Filter Preview */}
                {previewUrl && (
                  <div className="w-full h-20 mb-3 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={previewUrl}
                      alt={`${filter.name} filter preview`}
                      className="w-full h-full object-cover transition-all duration-300"
                      style={{ filter: filter.cssFilter }}
                    />
                  </div>
                )}

                {/* Filter Info */}
                <div className="text-left">
                  <h4 className={`font-semibold text-sm mb-1 ${
                    selectedFilter === filter.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {filter.name}
                  </h4>
                  <p className={`text-xs leading-relaxed ${
                    selectedFilter === filter.id ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    {filter.description}
                  </p>
                </div>

                {/* Selection Indicator */}
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  selectedFilter === filter.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 bg-white group-hover:border-gray-400'
                }`}>
                  {selectedFilter === filter.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Filter Info */}
        {selectedFilterOption && (
          <div className={`p-4 rounded-xl border ${
            selectedFilter === 'none' 
              ? 'bg-gray-50 border-gray-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedFilter === 'none' ? 'bg-gray-200' : 'bg-blue-500'
              }`}>
                <Palette className={`w-4 h-4 ${
                  selectedFilter === 'none' ? 'text-gray-500' : 'text-white'
                }`} />
              </div>
              <div>
                <p className={`font-semibold ${
                  selectedFilter === 'none' ? 'text-gray-700' : 'text-blue-900'
                }`}>
                  {selectedFilterOption.name} Filter Applied
                </p>
                <p className={`text-sm ${
                  selectedFilter === 'none' ? 'text-gray-600' : 'text-blue-700'
                }`}>
                  {selectedFilterOption.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
        <button
          onClick={back}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          onClick={next}
          disabled={!selectedFilter}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            !selectedFilter
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