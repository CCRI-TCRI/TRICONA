"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Camera, Loader2 } from "lucide-react"

interface FaceRecognitionProps {
  onSuccess: (faceData: string) => void
  onError: (error: string) => void
  studentId: string
}

export function FaceRecognition({ onSuccess, onError, studentId }: FaceRecognitionProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      onError("Camera access denied. Please enable camera permissions.")
    }
  }

  const captureAndVerifyFace = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsProcessing(true)

    try {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      if (!context) throw new Error("Canvas context not available")

      // Set canvas dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to base64
      const imageData = canvas.toDataURL("image/jpeg", 0.8)

      // Simulate face recognition processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real implementation, you would:
      // 1. Send imageData to a face recognition service (like AWS Rekognition, Azure Face API, or a custom ML model)
      // 2. Compare with stored face encoding for the student
      // 3. Return match confidence score

      // For demo purposes, we'll simulate a successful match
      const mockFaceData = {
        studentId,
        faceEncoding: imageData.substring(0, 100) + "...", // Truncated for demo
        confidence: 0.95,
        timestamp: new Date().toISOString(),
      }

      onSuccess(JSON.stringify(mockFaceData))
    } catch (error) {
      onError("Face recognition failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Camera className="w-5 h-5" />
          Face Verification
        </CardTitle>
        <p className="text-sm text-muted-foreground">Look directly at the camera and click capture</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-64 bg-black rounded-lg object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Face detection overlay */}
          <motion.div
            className="absolute inset-4 border-2 border-green-400 rounded-lg"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.02, 1],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>

        <Button onClick={captureAndVerifyFace} disabled={isProcessing || !stream} className="w-full">
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Capture & Verify Face
            </>
          )}
        </Button>

        <div className="text-xs text-center text-muted-foreground">
          <p>• Ensure good lighting</p>
          <p>• Look directly at the camera</p>
          <p>• Remove glasses if possible</p>
        </div>
      </CardContent>
    </Card>
  )
}
