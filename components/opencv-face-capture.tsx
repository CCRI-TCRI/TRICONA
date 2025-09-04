"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, CheckCircle, X } from "lucide-react"

interface FaceCaptureProps {
  onFaceCapture: (faceData: string) => void
  onCancel: () => void
}

export function OpenCVFaceCapture({ onFaceCapture, onCancel }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Camera access error:", error)
    }
  }

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    if (context) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      // Convert to base64 for face recognition processing
      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      // Simulate OpenCV face detection processing
      setTimeout(() => {
        onFaceCapture(imageData)
        setIsCapturing(false)
      }, 2000)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Face Recognition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video ref={videoRef} autoPlay muted className="w-full h-64 bg-black rounded-lg" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Face detection overlay */}
          <div className="absolute inset-4 border-2 border-green-400 rounded-lg opacity-70" />
        </div>

        <div className="flex gap-2">
          <Button onClick={captureFace} disabled={isCapturing} className="flex-1">
            {isCapturing ? "Processing..." : "Capture Face"}
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
          <Button onClick={onCancel} variant="outline">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
