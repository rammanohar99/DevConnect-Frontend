import { useState, useRef, ChangeEvent } from 'react'
import { useUploadAvatar } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatar?: string
  userName: string
  onSuccess?: () => void
}

export default function AvatarUpload({ currentAvatar, userName, onSuccess }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAvatar = useUploadAvatar()

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = () => {
    if (!selectedFile) return

    uploadAvatar.mutate(
      {
        file: selectedFile,
        onProgress: setUploadProgress,
      },
      {
        onSuccess: () => {
          setPreview(null)
          setSelectedFile(null)
          setUploadProgress(0)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
          if (onSuccess) onSuccess()
        },
      }
    )
  }

  const handleCancel = () => {
    setPreview(null)
    setSelectedFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayAvatar = preview || currentAvatar

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar Display */}
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {displayAvatar ? (
              <img src={displayAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-primary">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">
              Upload a new profile picture. JPG, PNG or GIF. Max size 5MB.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
          </div>
        </div>

        {/* Preview and Upload Controls */}
        {preview && selectedFile && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={uploadAvatar.isPending}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Upload Progress */}
            {uploadAvatar.isPending && uploadProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={uploadAvatar.isPending}>
                {uploadAvatar.isPending ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={uploadAvatar.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {uploadAvatar.isError && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {uploadAvatar.error instanceof Error
              ? uploadAvatar.error.message
              : 'Failed to upload avatar. Please try again.'}
          </div>
        )}

        {/* Success Message */}
        {uploadAvatar.isSuccess && !preview && (
          <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-md">
            Avatar uploaded successfully!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
