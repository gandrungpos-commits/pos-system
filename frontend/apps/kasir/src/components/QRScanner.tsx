import React, { useState, useEffect } from 'react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  const handleInput = (value: string) => {
    setInput(value);

    // Detect QR code patterns (simplified)
    if (value.includes('TABLE') || value.length > 20) {
      onScan(value);
      setInput('');
    }
  };

  // Keyboard input for barcode scanner
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isOpen && e.key !== 'Escape') {
        // Barcode scanners typically send data very quickly
        handleInput(input + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [input, isOpen]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" hidden={!isOpen}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
        <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-500 text-sm">Arahkan scanner atau tekan ESC untuk batal</p>
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleInput(input);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
              setInput('');
            }
          }}
          autoFocus
          className="input w-full mb-4"
          placeholder="Scanner ready..."
        />
        <button
          onClick={() => {
            setIsOpen(false);
            setInput('');
          }}
          className="btn-outline w-full"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
