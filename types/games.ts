export interface TopupField {
  key: string;
  label: string;
  required: boolean;
  type: "text" | "dropdown";
  options?: { label: string; value: string }[];
}

export interface TopupOption {
  supplier_id: string;
  supplier_name: string;
  game_topup_type_id: string;
  topup_type_name: string;
  display_name: string;
  description?: string | null;
  is_active?: boolean;
}

export interface GameTopupType {
  id: string;
  name: string;
  topup_fields?: TopupField[];
}

export interface GamePackage {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  is_active?: boolean;
  supplier_id: string;
  game_topup_type_id: string;
  original_price?: number;
  has_discount?: boolean;
}

export interface GameDetails {
  id: string;
  name: string;
  slug?: string | null;
  image_url?: string;
  description?: string;
  package_count?: number;
  packages: GamePackage[];
  topup_options?: TopupOption[];
  game_topup_types?: GameTopupType[];
  // legacy flat fields (fallback when no topup_options)
  topup_fields?: TopupField[];
}

export interface TopupGuide {
  id: string;
  game_id: string;
  steps: string[];
  note?: string;
}
