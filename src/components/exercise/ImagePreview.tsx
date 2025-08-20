"use client";

import { CloseIcon } from "@/icons";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ImagePreviewProps {
  image?: File | string | null;
  alt?: string;
  className?: string;
  onRemove?: () => void;
}

export default function ImagePreview({
  image,
  alt = "Image Preview",
  className = "",
  onRemove,
}: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(image ?? null);
    }
  }, [image]);

  if (!previewUrl) {
    return null;
  }

  return (
    <div className="relative w-20 h-20">
      <CloseIcon className="absolute -top-2 -right-2 z-10 fill-black cursor-pointer bg-white rounded-full" onClick={onRemove} />
      <Image
        src={previewUrl}
        alt={alt}
        width={80}
        height={80}
        className={`w-20 h-20 object-cover rounded-xl ${className}`}
      />
    </div>
  );
}