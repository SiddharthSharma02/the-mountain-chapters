import Image, { type ImageProps } from "next/image";
import { resolveImage } from "@/lib/images/hosts";

type SafeImageProps = Omit<ImageProps, "src"> & { src: string | null | undefined };

/** next/image that never throws on an unknown host or a broken URL. */
export function SafeImage({ src, alt, unoptimized, ...props }: SafeImageProps) {
  const resolved = resolveImage(src);
  return <Image {...props} alt={alt} src={resolved.src} unoptimized={unoptimized || resolved.unoptimized} />;
}
