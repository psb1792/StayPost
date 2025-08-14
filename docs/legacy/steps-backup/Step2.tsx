import React, { useEffect } from 'react';
import { Sparkles, Loader2, MessageSquare, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import useGenerateCaptions from '../../hooks/useGenerateCaptions';

interface Step2Props {
  files: File[];
  captions: string[];
  setCaptions: (captions: string[]) => void;
  next: () => void;
  back: () => void;
}

export default function Step2({ files, captions, setCaptions, next, back }: Step2Props) {
  const { captions: localCaptions, loading, error, generate } = useGenerateCaptions();

  // Sync hook captions with parent state
  useEffect(() => {
    if (localCaptions.length > 0) {
      setCaptions(localCaptions);
    }
  }, [localCaptions, setCaptions]);

  const handleGenerate = async () => {
    if (files.length === 0) return;
    await generate(files);
  };

  const handleRetry = () => {
    handleGenerate();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">2) Generate Captions</h2>
        <p className="text-gray-600">
          Create engaging captions for your {files.length} uploaded image{files.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Initial State - Ready to Generate */}
        {captions.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-purple-500" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Ready to Generate Captions
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Our AI will analyze your images and create compelling captions that capture the essence of each photo.
            </p>

            <button
              onClick={handleGenerate}
              disabled={files.length === 0}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
                files.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Generate Captions
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generating Captions...
            </h3>
            <p className="text-gray-600 font-medium">
              Analyzing your images and crafting perfect captions
            </p>
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Generation Failed
            </h3>
            <div className="bg-red-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-red-700 text-sm font-medium">
                {error}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Success State - Generated Captions */}
        {captions.length > 0 && !loading && !error && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Generated Captions</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Ready</span>
                </div>
              </div>
              
              <button
                onClick={handleGenerate}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:bg-blue-50 px-3 py-1 rounded-lg transition-all duration-200"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </button>
            </div>

            <div className="grid gap-4">
              {captions.map((caption, index) => (
                <div
                  key={index}
                  className="group p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 hover:shadow-md hover:border-green-300 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors duration-200">
                      <span className="text-sm font-bold text-green-600">{index + 1}</span>
                    </div>
                    <p className="text-gray-800 font-medium leading-relaxed flex-1">
                      {caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-blue-800 font-semibold mb-1">
                    Perfect! Your captions are ready ✨
                  </p>
                  <p className="text-blue-700 text-sm">
                    You can now proceed to the next step to select your preferred content, or regenerate if you'd like different options.
                  </p>
                </div>
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
          disabled={captions.length === 0}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            captions.length === 0
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