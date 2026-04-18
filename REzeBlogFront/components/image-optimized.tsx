// Optimized Image Component with next/image
// 작성일: 2026-04-18

'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
  fill?: boolean
  sizes?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  fill = false,
  sizes = '100vw',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-[#2f3136] animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        quality={75}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAAgACABAREA/8QAGAAAAgMBAAAAAAAAAAAAAAAABAUCAwYB/8QAJRAAAgICAgICAgMBAAAAAAAAAQIAAwQFBhESBxMhMQgUQVEU/9oACAEBAAA/APkS5S7xwsrjuRzCscNplS0nTIKk3KeNrK4jXpPGT5SGJgE4DOUFJlVSWs1sKFNhLVLn0mAWZz7KGiRyrVqr2+osopVqDm1spMvaagLWgkbM5hCAYqIspcI+8WuU5FJuR5qltJcJpUshl8asFS72FNShNcHVmlI6PqNMvKnMSYlJVIaJoB8RGQu3O43HIUy1TadJ5ajVrJAJynQ4qg88p2nPGRTEGAASAAO/vHbNbFd1vluMbSTXIVtw4zO02bmzRaBVxVhReVFJFJJp+jlEYDKgEy0SakQIoRxEREREREf/Z"
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  )
}
