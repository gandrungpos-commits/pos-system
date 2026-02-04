import React, { useState } from 'react';

interface QRScannerProps {
  onScan: (result: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function QRScannerModal({ onScan, isOpen, onClose }: QRScannerProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const qrData = input.trim();
      if (!qrData) {
        setError('QR tidak valid');
        return;
      }
      onScan(qrData);
      setInput('');
      setError('');
    } else if (e.key === 'Escape') {
      onClose();
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-center">Scan Menu</h2>
        <p className="text-gray-600 text-center mb-6">Arahkan kamera ke QR code</p>
        
        {/* Camera Preview Placeholder */}
        <div className="bg-gray-100 rounded-xl p-12 mb-6 text-center aspect-square flex items-center justify-center border-2 border-dashed border-gray-300">
          <div>
            <div className="text-4xl mb-2">📱</div>
            <p className="text-gray-500 text-sm">Scanning...</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="input w-full mb-4"
          placeholder="Hasil scan akan muncul di sini"
        />

        <button
          onClick={() => {
            onClose();
            setInput('');
            setError('');
          }}
          className="btn-outline w-full"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
