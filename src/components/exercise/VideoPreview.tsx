"use client";

import { CloseIcon } from "@/icons";
import { useEffect, useState } from "react";

interface ImagePreviewProps {
  video?: File | string | null;
  alt?: string;
  className?: string;
  onRemove?: () => void;
}

export default function ImagePreview({
  video,
  className = "",
  onRemove,
}: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (video instanceof File) {
      const objectUrl = URL.createObjectURL(video);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(video ?? null);
    }
  }, [video]);

  if (!previewUrl) {
    return null;
  }

  return (
    <div className="relative w-60">
      <CloseIcon className="absolute -top-2 -right-2 z-10 fill-black cursor-pointer bg-white rounded-full" onClick={onRemove} />
      <video
        controls
        src={previewUrl}
        className={`rounded-2xl ${className}`}
      />
    </div>
  );
}