export interface GameItem {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  category?: string;
}

export interface RecommendGame extends GameItem {
  sequence: number;
}
