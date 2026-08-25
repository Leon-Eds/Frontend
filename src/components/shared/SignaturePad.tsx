import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

export default function SignaturePad({ onSave, onCancel }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleEnd = () => {
    setIsEmpty(sigCanvas.current?.isEmpty() ?? true);
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      return;
    }
    const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataUrl) {
      onSave(dataUrl);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white relative group">
        <SignatureCanvas 
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-48 sm:h-64 cursor-crosshair touch-none'
          }}
          onEnd={handleEnd}
          penColor="#000000"
          backgroundColor="rgba(255,255,255,0)"
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 font-medium">
            Sign here
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <button 
          type="button" 
          onClick={clear} 
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Eraser className="w-4 h-4" />
          Clear
        </button>
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={save}
            disabled={isEmpty}
            className="flex items-center gap-2 px-4 py-2 bg-[#053d26] text-white rounded-lg text-sm font-bold hover:bg-[#042c1b] transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Save Signature
          </button>
        </div>
      </div>
    </div>
  );
}
