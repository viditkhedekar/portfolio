import Image from "next/image";

// The alpha silhouette of the illustrated portrait.
const silhouette = "M693 72Q665 64 628 66Q590 68 552 79Q513 90 467 115Q421 140 397 166Q373 193 354 236Q336 280 338 318Q340 357 358 393Q376 429 374 454Q372 480 391 521Q410 562 420 570Q431 578 444 577Q456 576 470 602Q484 629 486 660Q487 691 440 746Q394 802 278 860Q163 919 138 973Q114 1027 136 1056Q159 1084 195 1110Q231 1136 278 1158Q324 1179 382 1195Q441 1211 547 1219Q653 1227 751 1215Q849 1203 936 1170Q1022 1136 1056 1112Q1091 1087 1116 1059Q1140 1031 1113 972Q1086 914 975 860Q864 806 822 754Q779 702 782 667Q784 632 799 600Q814 569 834 560Q853 552 870 510Q887 468 888 449Q888 430 880 418Q873 406 884 374Q896 341 895 297Q894 253 886 234Q877 214 846 176Q815 139 788 130Q761 121 741 100Q721 79 693 72Z";

export function ViditPortrait({ sizes, decorative = false }: { sizes: string; decorative?: boolean }) {
  return (
    <span className="portrait-image">
      <Image src="/vidit-avatar.webp" alt={decorative ? "" : "Illustrated portrait of Vidit Khedekar"} width={640} height={640} sizes={sizes} />
      <svg className="portrait-outline" viewBox="0 0 1254 1254" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="19" strokeLinecap="round">
        <path pathLength="1" d={silhouette} />
      </svg>
    </span>
  );
}
