/** SVG-иконки предметов (заливка + контур). */

export function GlyphShape({
  glyph,
  itemId,
  accent,
}: {
  glyph: string;
  itemId?: string;
  accent: string;
}) {
  const stroke = accent;
  const fill = accent;

  const mark = itemId ? itemMark(itemId) : null;

  const shape = (() => {
    switch (glyph) {
      case "cap":
        return (
          <>
            <path d="M6 14 Q12 8 18 14" fill="none" stroke={stroke} strokeWidth="1.7" />
            <path d="M4 15 H20" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
            <path d="M8 12 H16" fill={fill} opacity="0.5" />
          </>
        );
      case "beret":
        return <ellipse cx="12" cy="13" rx="7" ry="3.2" fill={fill} opacity="0.85" />;
      case "band":
        return <path d="M5 13 Q12 9 19 13" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />;
      case "veil":
        return (
          <path d="M7 9 Q12 7 17 9 L16 18 Q12 20 8 18 Z" fill={fill} opacity="0.35" stroke={stroke} strokeWidth="1.3" />
        );
      case "hood":
        return <path d="M6 16 Q5 7 12 6 Q19 7 18 16" fill={fill} opacity="0.4" stroke={stroke} strokeWidth="1.5" />;
      case "circlet":
        return (
          <>
            <path d="M5 14 Q12 9 19 14" fill="none" stroke={stroke} strokeWidth="1.8" />
            <circle cx="12" cy="10" r="1.5" fill={fill} />
          </>
        );
      case "crown":
        return <path d="M5 16 L8 8 L12 13 L16 8 L19 16 Z" fill={fill} opacity="0.9" stroke={stroke} strokeWidth="0.8" />;
      case "helm":
        return (
          <>
            <path d="M6 15 Q6 6 12 6 Q18 6 18 15 Z" fill={fill} opacity="0.55" stroke={stroke} strokeWidth="1.4" />
            <path d="M6 13 H18" stroke={stroke} strokeWidth="1.2" />
          </>
        );
      case "shirt":
        return <path d="M8 8 L12 11 L16 8 L18 11 L16 19 H8 L6 11 Z" fill={fill} opacity="0.45" stroke={stroke} strokeWidth="1.2" />;
      case "jacket":
        return (
          <>
            <path d="M8 7 L12 11 L16 7 L19 10 V19 H5 V10 Z" fill={fill} opacity="0.4" stroke={stroke} strokeWidth="1.2" />
            <path d="M12 11 V19" stroke={stroke} strokeWidth="1" />
          </>
        );
      case "vest":
        return <path d="M9 7 H15 L16 19 H8 Z" fill={fill} opacity="0.5" stroke={stroke} strokeWidth="1.2" />;
      case "cloak":
        return <path d="M7 8 Q12 6 17 8 L19 19 H5 Z" fill={fill} opacity="0.35" stroke={stroke} strokeWidth="1.2" />;
      case "dress":
        return <path d="M9 7 H15 L18 19 H6 Z" fill={fill} opacity="0.4" stroke={stroke} strokeWidth="1.2" />;
      case "robe":
        return (
          <>
            <path d="M8 7 H16 L17 19 H7 Z" fill={fill} opacity="0.38" stroke={stroke} strokeWidth="1.2" />
            <path d="M12 10 V16" stroke={stroke} strokeWidth="1" opacity="0.8" />
          </>
        );
      case "armor":
        return (
          <>
            <path d="M8 8 H16 L17 18 H7 Z" fill={fill} opacity="0.5" stroke={stroke} strokeWidth="1.3" />
            <path d="M12 8 V18 M8 13 H16" stroke={stroke} strokeWidth="0.9" opacity="0.7" />
          </>
        );
      case "pants":
        return <path d="M8 6 H16 L15 12 L18 20 H14 L12 13 L10 20 H6 L9 12 Z" fill={fill} opacity="0.45" stroke={stroke} strokeWidth="1" />;
      case "shorts":
        return <path d="M8 8 H16 L15 12 L17 16 H13 L12 13 L11 16 H7 L9 12 Z" fill={fill} opacity="0.5" stroke={stroke} strokeWidth="1" />;
      case "skirt":
        return <path d="M9 8 H15 L18 18 H6 Z" fill={fill} opacity="0.42" stroke={stroke} strokeWidth="1.1" />;
      case "sandals":
        return (
          <>
            <path d="M7 16 Q12 13 17 16" fill="none" stroke={stroke} strokeWidth="1.6" />
            <ellipse cx="9" cy="16" rx="3" ry="1.2" fill={fill} />
            <ellipse cx="15" cy="16" rx="3" ry="1.2" fill={fill} />
          </>
        );
      case "boots":
        return <path d="M8 6 H14 V14 H18 V18 H7 Z" fill={fill} opacity="0.55" stroke={stroke} strokeWidth="1.1" />;
      case "greaves":
        return (
          <>
            <path d="M8 6 H11 V18 H8 Z M13 6 H16 V18 H13 Z" fill={fill} opacity="0.5" stroke={stroke} strokeWidth="0.9" />
          </>
        );
      case "leaf":
        return <path d="M12 19 Q6 12 12 5 Q18 12 12 19" fill={fill} opacity="0.7" />;
      case "fang":
        return <path d="M9 6 L12 18 L15 6 Z" fill={fill} />;
      case "moon":
        return <path d="M14 6 A6 6 0 1 0 14 18 A4.5 4.5 0 1 1 14 6" fill={fill} />;
      case "ring":
        return <circle cx="12" cy="13" r="4.5" fill="none" stroke={stroke} strokeWidth="2" />;
      case "flame":
        return <path d="M12 20 Q7 14 10 10 Q9 14 12 12 Q13 8 14 5 Q18 12 12 20" fill={fill} />;
      case "star":
        return <path d="M12 4 L14 10 H20 L15 14 L17 20 L12 16 L7 20 L9 14 L4 10 H10 Z" fill={fill} />;
      case "staff":
        return (
          <>
            <path d="M12 21 V6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="5" r="2.4" fill={fill} />
          </>
        );
      case "dagger":
        return (
          <>
            <path d="M12 3 L14 14 H10 Z" fill={fill} />
            <path d="M8 15 H16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
            <path d="M12 15 V20" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          </>
        );
      case "sword":
        return (
          <>
            <path d="M12 2 L14 15 H10 Z" fill={fill} />
            <path d="M7 16 H17" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
            <path d="M12 16 V21" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          </>
        );
      case "bow":
        return (
          <>
            <path d="M15 4 Q7 12 15 20" fill="none" stroke={stroke} strokeWidth="1.8" />
            <path d="M15 4 L15 20" stroke={stroke} strokeWidth="1" opacity="0.6" />
          </>
        );
      case "axe":
        return (
          <>
            <path d="M13 21 V8" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M13 8 C18 6 20 12 14 14 C19 14 19 7 13 9 Z" fill={fill} />
          </>
        );
      case "spear":
        return (
          <>
            <path d="M12 21 V8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
            <path d="M12 3 L15 9 H9 Z" fill={fill} />
          </>
        );
      case "mace":
        return (
          <>
            <path d="M12 21 V10" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="7" r="3.2" fill={fill} />
          </>
        );
      case "blade":
        return (
          <>
            <path d="M12 2 L15 16 H9 Z" fill={fill} />
            <path d="M6 17 H18" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M12 17 V22" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
          </>
        );
      case "wand":
        return (
          <>
            <path d="M12 21 V8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
            <path d="M12 3 L13.4 6.2 L16.8 6.4 L14.2 8.4 L15.2 11.6 L12 9.8 L8.8 11.6 L9.8 8.4 L7.2 6.4 L10.6 6.2 Z" fill={fill} />
          </>
        );
      case "relic":
        return (
          <>
            <path d="M12 2 L15 15 H9 Z" fill={fill} />
            <path d="M6 16 H18" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill="#fff" opacity="0.8" />
            <path d="M12 16 V21" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          </>
        );
      default:
        return <circle cx="12" cy="12" r="4" fill="none" stroke={stroke} strokeWidth="1.6" />;
    }
  })();

  return (
    <>
      {shape}
      {mark}
    </>
  );
}

function itemMark(itemId: string) {
  switch (itemId) {
    case "cap_trainee":
      return <circle cx="18" cy="6" r="1.2" fill="#fff" opacity="0.7" />;
    case "beret_ink":
      return <circle cx="16" cy="11" r="1" fill="#1e293b" />;
    case "weapon_relic":
      return <path d="M6 5 L8 7 M18 5 L16 7" stroke="#fff" strokeWidth="0.8" opacity="0.6" />;
    case "charm_star":
      return <circle cx="18" cy="6" r="1.3" fill="#fff" opacity="0.85" />;
    case "armor_season":
      return <path d="M12 9 V12" stroke="#fff" strokeWidth="0.9" opacity="0.5" />;
    case "cloak_fog":
      return <path d="M5 14 Q12 16 19 14" stroke="#fff" strokeWidth="0.7" opacity="0.35" fill="none" />;
    case "weapon_wand":
      return <circle cx="12" cy="4" r="0.9" fill="#fff" opacity="0.8" />;
    case "boots_sprint":
      return <path d="M7 17 H11 M13 17 H17" stroke="#1e293b" strokeWidth="0.8" />;
    case "charm_flame":
      return <circle cx="14" cy="8" r="1" fill="#fff" opacity="0.6" />;
    case "helm_watch":
      return <rect x="9" y="9" width="6" height="2" rx="0.5" fill="#fff" opacity="0.35" />;
    default:
      return (
        <circle
          cx="19"
          cy="5"
          r="1"
          fill="#fff"
          opacity={0.25 + (itemId.length % 5) * 0.08}
        />
      );
  }
}
