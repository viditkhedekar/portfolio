import { markArt, type MarkKind } from "@/lib/item-mark";

export function ItemMark({
  itemKey,
  label,
  kind,
  size = 28,
  className,
}: {
  itemKey: string;
  label: string;
  kind: MarkKind;
  size?: number;
  className?: string;
}) {
  const { color, rects } = markArt(itemKey, label, kind);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      shapeRendering="crispEdges"
      className={className}
    >
      <rect width="48" height="48" rx="4" fill="#08090a" />
      <rect x=".5" y=".5" width="47" height="47" rx="3.5" fill="none" stroke="#30372b" />
      <g fill={color}>
        <rect x="6" y="6" width="8" height="2" />
        {rects.map((rect, i) => <rect key={i} {...rect} />)}
      </g>
    </svg>
  );
}
