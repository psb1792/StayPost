import React from 'react';
import { Check, ArrowLeft, MessageSquare } from 'lucide-react';

interface Step3Props {
  captions: string[];
  selected: string | null;
  setSelected: (caption: string) => void;
  next: () => void;
  back: () => void;
}

export default function Step3({ captions, selected, setSelected, next, back }: Step3Props) {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">3) Choose Your Caption</h2>
        <p className="text-gray-600">
          Select the caption that best represents your content
        </p>
      </div>

      {/* Caption Selection Grid */}
      <div className="space-y-4">
        {captions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No captions available. Please go back and generate captions first.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
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
                <strong>Perfect!</strong> You've selected your caption. Ready to proceed to the final step.
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