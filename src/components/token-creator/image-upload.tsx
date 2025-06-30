import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { PinataSDK } from 'pinata'
import { toast } from 'sonner'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY!,
})

const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN

const constructPinataUrl = (cid: string) => {
  const baseUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${cid}`
  return PINATA_GATEWAY_TOKEN ? `${baseUrl}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}` : baseUrl
}

export function ImageUpload({ onImageUploaded }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback((croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const file = e.target.files?.[0]

    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('File selected:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
    })

    if (file.size > 5 * 1024 * 1024) {
      const error = 'File size must be less than 5MB'
      console.error(error, { fileSize: file.size })
      setError(error)
      return
    }

    if (!file.type.startsWith('image/')) {
      const error = 'File must be an image'
      console.error(error, { fileType: file.type })
      setError(error)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      console.log('File read successfully')
      setImage(reader.result as string)
    }
    reader.onerror = () => {
      const error = 'Error reading file'
      console.error(error, reader.error)
      setError(error)
    }
    reader.readAsDataURL(file)
  }

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getCroppedImg = async (imageSrc: string, pixelCrop: CropArea): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    // Set canvas size to the cropped size (making it square)
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/png')
    })
  }

  const uploadToPinata = async (blob: Blob) => {
    console.log('Starting Pinata upload...', {
      blobSize: `${(blob.size / 1024 / 1024).toFixed(2)}MB`,
      blobType: blob.type,
    })

    try {
      setIsUploading(true)
      setError(null)

      // Check if Pinata credentials are configured
      if (!process.env.NEXT_PUBLIC_PINATA_JWT || !process.env.NEXT_PUBLIC_PINATA_GATEWAY) {
        throw new Error('Pinata credentials not configured')
      }

      console.log('Creating file for upload...')
      const file = new File([blob], 'token-image.png', { type: 'image/png' })

      console.log('Uploading to Pinata...')
      const upload = await pinata.upload.public.file(file)
      console.log('Upload successful:', upload)

      const url = constructPinataUrl(upload.cid)
      console.log('Generated IPFS URL:', url)

      // Verify the image is accessible
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to verify image: ${response.statusText}`)
        }
        console.log('Image URL verified successfully')
      } catch (verifyError) {
        console.error('Error verifying image:', verifyError)
        throw new Error('Image uploaded but not accessible. Please check Pinata configuration.')
      }

      toast.success('Image uploaded successfully')
      onImageUploaded(url)
      setImage(null)
      setCroppedAreaPixels(null)
    } catch (error) {
      console.error('Error uploading to Pinata:', {
        error,
        pinataJwtConfigured: !!process.env.NEXT_PUBLIC_PINATA_JWT,
        pinataGatewayConfigured: !!process.env.NEXT_PUBLIC_PINATA_GATEWAY,
        pinataGatewayTokenConfigured: !!PINATA_GATEWAY_TOKEN,
      })

      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image. Please try again.'

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCrop = async () => {
    if (!image || !croppedAreaPixels) {
      console.log('No image or crop area selected')
      return
    }

    try {
      console.log('Starting image crop...', croppedAreaPixels)
      const croppedImage = await getCroppedImg(image, croppedAreaPixels)
      console.log('Image cropped successfully', {
        size: `${(croppedImage.size / 1024 / 1024).toFixed(2)}MB`,
        type: croppedImage.type,
      })

      await uploadToPinata(croppedImage)
    } catch (error) {
      console.error('Error processing image:', error)
      const errorMessage = 'Failed to process image. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <div className="space-y-4">
      {!image ? (
        <>
          <Label htmlFor="image-upload" className="cursor-pointer block">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
              <p>Click to upload image</p>
              <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
          </Label>
          <input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </>
      ) : (
        <div className="space-y-4">
          <div className="relative h-[300px] w-full border rounded-lg overflow-hidden bg-black">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setImage(null)
                setCroppedAreaPixels(null)
                setError(null)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCrop}
              disabled={isUploading}
              className="flex-1 bg-white text-black border border-gray-300 hover:bg-gray-50"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  )
}
