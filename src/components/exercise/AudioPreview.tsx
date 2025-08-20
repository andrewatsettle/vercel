"use client";

import { CloseIcon } from "@/icons";
import { useEffect, useState } from "react";

interface AudioPreviewProps {
  audio?: File | string | null;
  alt?: string;
  className?: string;
  onRemove?: () => void;
}

export default function AudioPreview({
  audio,
  className = "",
  onRemove,
}: AudioPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audio instanceof File) {
      const objectUrl = URL.createObjectURL(audio);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(audio ?? null);
    }
  }, [audio]);

  if (!previewUrl) {
    return null;
  }

  return (
    <div className="relative w-[300px]">
      <CloseIcon className="absolute -top-2 -right-2 z-10 fill-black cursor-pointer bg-white rounded-full" onClick={onRemove} />
      <audio
        controls
        src={previewUrl}
        className={`${className}`}
      />
    </div>
  );
}