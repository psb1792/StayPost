import React from 'react';
import { Check, ArrowLeft, MessageSquare, Image as ImageIcon, Palette } from 'lucide-react';

interface Step3Props {
  captions: string[];
  selected: string | null;
  setSelected: (caption: string) => void;
  selectedFilter: string | null;
  previewUrl: string | null;
  next: () => void;
  back: () => void;
}

const filterOptions = [
  { id: 'none', name: 'Original', cssFilter: 'none' },
  { id: 'warm', name: 'Warm', cssFilter: 'sepia(0.3) saturate(1.2) brightness(1.1) contrast(1.1)' },
  { id: 'vivid', name: 'Vivid', cssFilter: 'saturate(1.5) contrast(1.2) brightness(1.05)' },
  { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(0.5) contrast(1.2) brightness(0.9) saturate(0.8)' },
  { id: 'cool', name: 'Cool', cssFilter: 'hue-rotate(180deg) saturate(1.1) brightness(1.05)' },
  { id: 'dramatic', name: 'Dramatic', cssFilter: 'contrast(1.5) brightness(0.9) saturate(1.3)' },
  { id: 'soft', name: 'Soft', cssFilter: 'brightness(1.1) contrast(0.9) saturate(0.9) blur(0.5px)' },
  { id: 'monochrome', name: 'Monochrome', cssFilter: 'grayscale(1) contrast(1.2) brightness(1.1)' }
];

export default function Step3({ captions, selected, setSelected, selectedFilter, previewUrl, next, back }: Step3Props) {
  const selectedFilterOption = filterOptions.find(f => f.id === selectedFilter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">3) Choose Your Caption</h2>
        <p className="text-gray-600">
          Select the caption that best represents your filtered content
        </p>
      </div>

      {/* Content Preview Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Filtered Image Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Your Image</h3>
              {selectedFilterOption && selectedFilter !== 'none' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  <Palette className="w-3 h-3" />
                  {selectedFilterOption.name}
                </div>
              )}
            </div>
            
            {previewUrl ? (
              <div className="relative bg-white rounded-xl overflow-hidden shadow-lg">
                <img
                  src={previewUrl}
                  alt="Filtered preview"
                  className="w-full h-48 object-cover"
                  style={{ 
                    filter: selectedFilterOption?.cssFilter || 'none'
                  }}
                />
                {selectedFilterOption && selectedFilter !== 'none' && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                    {selectedFilterOption.name} Filter
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No image available</p>
                </div>
              </div>
            )}
          </div>

          {/* Caption Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900">Selected Caption</h3>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg min-h-[12rem] flex items-center">
              {selected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">Selected</span>
                  </div>
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {selected}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-400 w-full">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Choose a caption below</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Caption Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Available Captions</h3>
        </div>

        {captions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No captions available</p>
            <p className="text-gray-400 text-sm">Please go back and generate captions first</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {captions.map((caption, index) => (
              <div
                key={index}
                onClick={() => setSelected(caption)}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                  selected === caption
                    ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Selection Indicator */}
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  selected === caption
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 bg-white'
                }`}>
                  {selected === caption && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Caption Number */}
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mb-4 ${
                  selected === caption
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </div>

                {/* Caption Text */}
                <div className="pr-8">
                  <p className={`text-lg font-medium leading-relaxed ${
                    selected === caption ? 'text-blue-900' : 'text-gray-800'
                  }`}>
                    {caption}
                  </p>
                </div>

                {/* Selection Highlight */}
                {selected === caption && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Selection Status */}
        {selected && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <p className="text-sm text-green-700">
                <strong>Perfect!</strong> You've selected your caption and applied the {selectedFilterOption?.name || 'Original'} filter. Ready to proceed to the final step.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
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
          disabled={!selected}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            !selected
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