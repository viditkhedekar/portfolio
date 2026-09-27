import { renderMarkSvg } from "@/lib/item-mark";

export const size = { width: 48, height: 48 };
export const contentType = "image/svg+xml";

export default function Icon() {
  return new Response(renderMarkSvg("school", "SCHOOL", "app"), {
    headers: { "Content-Type": contentType },
  });
}
