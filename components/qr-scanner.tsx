"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode"

export function QRScanner({ onScan, onClose }: { onScan: (decodedText: string) => void, onClose: () => void }) {
  const [error, setError] = useState("")

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { 
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    }, false)

    scanner.render((text) => {
      scanner.clear()
      onScan(text)
    }, (err) => {
      // Ignorar errores de no encontrar QR en el frame
    })

    return () => {
      scanner.clear().catch(e => console.error("Error clearing scanner", e))
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white p-4 rounded-xl shadow-2xl max-w-sm w-full relative">
        <h3 className="text-xl font-black text-center mb-4 text-black">Escanear Código</h3>
        <div id="reader" className="w-full text-black"></div>
        {error && <p className="text-red-500 text-center mt-2 font-bold">{error}</p>}
        <button 
          onClick={onClose}
          className="w-full bg-black text-white font-bold py-3 rounded-lg mt-4"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
