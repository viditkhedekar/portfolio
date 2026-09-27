import { renderMarkSvg } from "@/lib/item-mark";

export const size = { width: 48, height: 48 };
export const contentType = "image/svg+xml";

export default function Icon() {
  return new Response(renderMarkSvg("archive", "ARCHIVE", "app"), {
    headers: { "Content-Type": contentType },
  });
}
