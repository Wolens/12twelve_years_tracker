/** Уникальная пиктограмма для каждого id из каталога (32×32, несколько цветов). */

export function ItemIconById({ itemId }: { itemId: string }) {
  switch (itemId) {
    case "cap_trainee":
      return (
        <>
          <path d="M6 14 H26 L24 10 H8 Z" fill="#2563eb" />
          <path d="M6 14 H26 V16 H6 Z" fill="#1d4ed8" />
          <ellipse cx="16" cy="18" rx="10" ry="2" fill="#1e40af" />
        </>
      );
    case "beret_ink":
      return (
        <>
          <ellipse cx="18" cy="14" rx="11" ry="4" fill="#1e293b" />
          <ellipse cx="12" cy="15" rx="4" ry="2" fill="#0f172a" />
        </>
      );
    case "band_cloth":
      return (
        <>
          <path d="M8 15 H24" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
          <path d="M8 15 H24" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
    case "veil_dusk":
      return (
        <>
          <path d="M10 10 Q16 8 22 10 L20 24 Q16 26 12 24 Z" fill="#6366f1" opacity="0.85" />
          <path d="M12 12 Q16 10 20 12" fill="none" stroke="#c7d2fe" strokeWidth="1" />
        </>
      );
    case "hood_focus":
      return (
        <>
          <path d="M8 18 Q8 8 16 7 Q24 8 24 18" fill="#312e81" />
          <circle cx="16" cy="14" r="2" fill="#1e1b4b" />
        </>
      );
    case "circlet_thin":
      return (
        <>
          <path d="M9 14 Q16 10 23 14" fill="none" stroke="#fcd34d" strokeWidth="2" />
          <circle cx="16" cy="11" r="1.5" fill="#fde68a" />
        </>
      );
    case "crown_week":
      return (
        <>
          <path d="M8 18 L11 10 L16 14 L21 10 L24 18 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
          <circle cx="11" cy="10" r="1" fill="#fff" />
          <circle cx="21" cy="10" r="1" fill="#fff" />
        </>
      );
    case "helm_watch":
      return (
        <>
          <path d="M10 18 Q10 9 16 8 Q22 9 22 18 Z" fill="#64748b" />
          <rect x="10" y="14" width="12" height="2" fill="#334155" />
          <rect x="14" y="10" width="4" height="3" fill="#1e293b" />
        </>
      );
    case "tunic_worn":
      return (
        <>
          <path d="M12 10 L16 13 L20 10 L22 14 L20 24 H12 L10 14 Z" fill="#cbb89a" />
          <path d="M14 13 H18 V17 H14 Z" fill="#8d6b45" />
          <path d="M11 20 H21" stroke="#a89070" strokeWidth="0.8" />
        </>
      );
    case "pants_worn":
      return (
        <>
          <path d="M12 10 H20 L19 16 L21 26 H17 L16 18 L15 26 H11 L13 16 Z" fill="#7c654c" />
          <path d="M13 18 H19" stroke="#5c4030" strokeWidth="0.7" />
        </>
      );
    case "shirt_basic":
      return (
        <>
          <path d="M12 10 L16 13 L20 10 L22 14 L20 24 H12 L10 14 Z" fill="#94a3b8" />
          <path d="M14 13 H18 V17 H14 Z" fill="#64748b" />
        </>
      );
    case "jacket_road":
      return (
        <>
          <path d="M11 9 L16 13 L21 9 L24 13 V24 H8 V13 Z" fill="#78350f" />
          <path d="M16 13 V24" stroke="#451a03" strokeWidth="1" />
          <path d="M8 13 H24" stroke="#92400e" strokeWidth="1" />
        </>
      );
    case "vest_runner":
      return (
        <>
          <path d="M13 10 H19 L20 24 H12 Z" fill="#ea580c" />
          <path d="M13 10 L16 14 L19 10" fill="#c2410c" />
        </>
      );
    case "cloak_fog":
      return (
        <>
          <path d="M10 10 Q16 8 22 10 L24 26 H8 Z" fill="#475569" opacity="0.9" />
          <path d="M16 10 V26" stroke="#334155" strokeWidth="0.8" />
        </>
      );
    case "dress_evening":
      return (
        <>
          <path d="M13 10 H19 L22 26 H10 Z" fill="#be185d" />
          <path d="M13 10 Q16 12 19 10" fill="#9d174d" />
        </>
      );
    case "robe_quiet":
      return (
        <>
          <path d="M12 10 H20 L21 26 H11 Z" fill="#4c1d95" />
          <path d="M16 12 V22" stroke="#6d28d9" strokeWidth="1.2" />
          <circle cx="16" cy="14" r="1" fill="#c4b5fd" />
        </>
      );
    case "armor_season":
      return (
        <>
          <path d="M11 10 H21 L22 22 H10 Z" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="0.8" />
          <path d="M16 10 V22 M11 15 H21" stroke="#64748b" strokeWidth="1" />
        </>
      );
    case "pants_basic":
      return (
        <>
          <path d="M12 10 H20 L19 16 L21 26 H17 L16 18 L15 26 H11 L13 16 Z" fill="#1e3a8a" />
        </>
      );
    case "shorts_warm":
      return (
        <>
          <path d="M12 12 H20 L19 17 L21 22 H17 L16 17 L15 22 H11 L13 17 Z" fill="#ca8a04" />
        </>
      );
    case "skirt_hem":
      return (
        <>
          <path d="M11 12 H21 L24 24 H8 Z" fill="#7c3aed" />
          <path d="M11 12 H21" stroke="#a78bfa" strokeWidth="1" />
        </>
      );
    case "sandals_dust":
      return (
        <>
          <ellipse cx="12" cy="22" rx="5" ry="2" fill="#a16207" />
          <ellipse cx="20" cy="22" rx="5" ry="2" fill="#a16207" />
          <path d="M10 20 Q12 16 14 20" fill="none" stroke="#713f12" strokeWidth="1" />
        </>
      );
    case "boots_sprint":
      return (
        <>
          <path d="M9 12 H14 V20 H8 V16 Z" fill="#44403c" />
          <path d="M18 12 H23 V20 H17 V16 Z" fill="#44403c" />
          <path d="M8 20 H15 M17 20 H24" stroke="#292524" strokeWidth="2" />
        </>
      );
    case "greaves_iron":
      return (
        <>
          <rect x="10" y="10" width="5" height="14" rx="1" fill="#71717a" />
          <rect x="17" y="10" width="5" height="14" rx="1" fill="#71717a" />
          <path d="M10 10 H15 M17 10 H22" stroke="#a1a1aa" strokeWidth="1" />
        </>
      );
    case "weapon_staff":
      return (
        <>
          <path d="M16 28 V8" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="16" cy="7" r="3" fill="#22c55e" />
          <circle cx="15" cy="6" r="1" fill="#bbf7d0" />
        </>
      );
    case "weapon_dagger":
      return (
        <>
          <path d="M16 6 L18 18 H14 Z" fill="#cbd5e1" />
          <path d="M12 19 H20" stroke="#78716c" strokeWidth="2" />
          <path d="M16 19 V24" stroke="#57534e" strokeWidth="2" />
        </>
      );
    case "weapon_sword":
      return (
        <>
          <path d="M16 4 L18 20 H14 Z" fill="#e2e8f0" />
          <path d="M11 21 H21" stroke="#fbbf24" strokeWidth="2.5" />
          <path d="M16 21 V27" stroke="#78716c" strokeWidth="2" />
        </>
      );
    case "weapon_bow":
      return (
        <>
          <path d="M20 6 Q10 16 20 26" fill="none" stroke="#92400e" strokeWidth="2" />
          <path d="M20 6 L20 26" stroke="#d6d3d1" strokeWidth="1" />
          <path d="M20 14 L26 14" stroke="#64748b" strokeWidth="1" />
        </>
      );
    case "weapon_axe":
      return (
        <>
          <path d="M17 26 V10" stroke="#78350f" strokeWidth="2.5" />
          <path d="M17 10 C24 8 26 16 19 16 C25 18 24 8 17 10 Z" fill="#94a3b8" />
        </>
      );
    case "weapon_spear":
      return (
        <>
          <path d="M16 26 V10" stroke="#78350f" strokeWidth="2" />
          <path d="M16 6 L20 12 H12 Z" fill="#cbd5e1" />
        </>
      );
    case "weapon_mace":
      return (
        <>
          <path d="M16 26 V14" stroke="#78350f" strokeWidth="2.5" />
          <circle cx="16" cy="10" r="5" fill="#71717a" />
          <circle cx="14" cy="8" r="1.5" fill="#e4e4e7" />
        </>
      );
    case "weapon_blade":
      return (
        <>
          <path d="M16 3 L19 21 H13 Z" fill="#e0f2fe" />
          <path d="M16 5 V19" stroke="#fff" strokeWidth="0.8" opacity="0.6" />
          <path d="M10 22 H22" stroke="#fbbf24" strokeWidth="3" />
        </>
      );
    case "weapon_wand":
      return (
        <>
          <path d="M16 26 V10" stroke="#5b3a29" strokeWidth="2" />
          <path d="M16 6 L17.5 9 H18.5 L17 11 L17.5 14 L16 12 L14.5 14 L15 11 L13.5 9 H14.5 Z" fill="#a78bfa" />
        </>
      );
    case "weapon_relic":
      return (
        <>
          <path d="M16 2 L19 20 H13 Z" fill="#fde68a" stroke="#f59e0b" strokeWidth="0.8" />
          <path d="M9 21 H23" stroke="#fbbf24" strokeWidth="3" />
          <circle cx="16" cy="21" r="2" fill="#fff" />
        </>
      );
    case "charm_leaf":
      return (
        <>
          <path d="M16 26 Q8 18 16 8 Q24 18 16 26" fill="#22c55e" />
          <path d="M16 10 V24" stroke="#14532d" strokeWidth="0.8" />
        </>
      );
    case "charm_fang":
      return (
        <>
          <path d="M13 8 L16 24 L19 8 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
          <path d="M14 10 L16 20 L18 10" fill="#e2e8f0" />
        </>
      );
    case "charm_moon":
      return (
        <>
          <path d="M20 10 A10 10 0 1 0 20 22 A7 7 0 1 1 20 10 Z" fill="#e0e7ff" />
        </>
      );
    case "charm_ring":
      return (
        <>
          <circle cx="16" cy="16" r="7" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
          <circle cx="16" cy="12" r="2" fill="#fde68a" />
        </>
      );
    case "charm_flame":
      return (
        <>
          <path d="M16 26 Q10 18 14 14 Q13 18 16 16 Q17 10 18 8 Q22 16 16 26" fill="#f97316" />
          <path d="M16 20 Q14 17 16 14" fill="#fde68a" />
        </>
      );
    case "charm_star":
      return (
        <>
          <path d="M16 6 L18 13 H26 L20 17 L22 24 L16 20 L10 24 L12 17 L6 13 H14 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="0.6" />
        </>
      );
    default:
      return <circle cx="16" cy="16" r="6" fill="#64748b" />;
  }
}
