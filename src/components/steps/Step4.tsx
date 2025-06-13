import React, { useState } from 'react';
import { Check, Copy, Download, ArrowLeft, CheckCircle, Image } from 'lucide-react';

interface Step4Props {
  selected: string | null;
  previewUrl: string | null;
  back: () => void;
}

export default function Step4({ selected, previewUrl, back }: Step4Props) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (selected) {
      try {
        await navigator.clipboard.writeText(selected);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const downloadZip = () => {
    console.log('Download ZIP functionality would be implemented here');
    // Placeholder for actual ZIP download implementation
  };

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">4) Review & Finish</h2>
        <p className="text-gray-600">
          Your content is ready! Review your selection and take action.
        </p>
      </div>

      {/* Success Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Setup Complete</span>
        </div>
      </div>

      {/* Content Preview Card */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-200 overflow-hidden shadow-lg">
        <div className="p-8">
          {/* Image Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-blue-500" />
              Image Preview
            </h3>
            
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                className="w-full h-48 object-cover rounded-xl border-2 border-blue-300"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl border-2 border-dashed border-blue-300 flex items-center justify-center">
                <div className="text-center">
                  <Image className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-blue-600 font-medium">No preview available</p>
                </div>
              </div>
            )}
          </div>

          {/* Selected Caption */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Caption</h3>
            
            {selected ? (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-gray-800 font-medium text-lg leading-relaxed">
                    {selected}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-500 text-center">No caption selected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Copy Caption Button */}
          <div className="relative">
            <button
              onClick={copyToClipboard}
              disabled={!selected}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                !selected
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              <Copy className="w-5 h-5" />
              Copy Caption
            </button>
            
            {/* Copied Tooltip */}
            {copied && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Copied!
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>

          {/* Download ZIP Button */}
          <button
            onClick={downloadZip}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Download className="w-5 h-5" />
            Download ZIP
          </button>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium mb-1">
                All Set! 🎉
              </p>
              <p className="text-sm text-blue-700">
                Your caption has been generated and is ready to use. You can copy it to your clipboard or download all your content as a ZIP file.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-start pt-6 border-t border-gray-100">
        <button
          onClick={back}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
}