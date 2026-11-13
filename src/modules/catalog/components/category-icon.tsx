import { Baby, Backpack, Crown, Flower2, Footprints, Glasses, Moon, Shirt, ShoppingBasket, Sun, type LucideProps } from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  bebe: Baby,
  fille: Flower2,
  garcon: Shirt,
  ceremonie: Crown,
  chaussures: Footprints,
  nuit: Moon,
  "sport-plage": Sun,
  ecole: Backpack,
  accessoires: Glasses,
};

export function CategoryIcon({ slug, ...props }: { slug: string } & LucideProps) {
  const Icon = ICONS[slug] ?? ShoppingBasket;
  return <Icon {...props} />;
}
