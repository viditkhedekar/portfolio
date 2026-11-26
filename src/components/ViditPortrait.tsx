import Image from "next/image";
import avatar from "../../public/vidit-avatar.webp";

// The alpha silhouette of the illustrated portrait.
const silhouette = "M688 73Q644 59 566 78Q488 98 472 115Q456 132 432 144Q408 155 390 178Q372 200 368 222Q365 244 352 266Q339 287 345 306Q351 324 346 340Q342 357 359 392Q376 427 376 460Q376 493 394 528Q411 564 434 571Q457 578 470 602Q483 627 484 659Q486 691 438 748Q391 804 278 861Q164 918 138 974Q113 1030 138 1060Q164 1090 211 1122Q258 1153 306 1173Q355 1193 414 1206Q473 1220 578 1224Q684 1229 774 1216Q864 1202 946 1168Q1027 1135 1060 1112Q1092 1088 1116 1060Q1141 1032 1114 973Q1086 914 975 860Q864 805 822 754Q780 702 782 666Q784 631 799 600Q814 568 834 560Q853 551 868 514Q884 478 886 456Q889 434 882 420Q876 407 888 370Q899 333 902 292Q904 251 890 234Q877 218 872 198Q866 178 844 157Q821 136 794 132Q766 127 750 107Q733 87 688 73Z";

export function ViditPortrait({ sizes, decorative = false }: { sizes: string; decorative?: boolean }) {
  return (
    <span className="portrait-image">
      <Image src={avatar} alt={decorative ? "" : "Illustrated portrait of Vidit Khedekar"} width={640} height={640} sizes={sizes} />
      <svg className="portrait-outline" viewBox="0 0 1254 1254" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="19" strokeLinecap="round">
        <path pathLength="1" d={silhouette} />
      </svg>
    </span>
  );
}
