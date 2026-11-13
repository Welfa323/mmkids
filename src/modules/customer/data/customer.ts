export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  zoneId: string;
  details: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  birthday: string;
  points: number;
  totalSpent: number;
  ordersCount: number;
  memberSince: string;
  addresses: Address[];
  billing: { company?: string; taxId?: string; address: string };
  twoFactor: boolean;
  newsletter: boolean;
  smsOptIn: boolean;
  whatsappOptIn: boolean;
}

export const DEMO_CUSTOMER: CustomerProfile = {
  id: "c001",
  firstName: "Jean",
  lastName: "Kouassi",
  email: "jean.kouassi@exemple.ci",
  phone: "+225 07 07 12 34 56",
  birthday: "1991-11-14",
  points: 1250,
  totalSpent: 486_000,
  ordersCount: 17,
  memberSince: "2024-03-08",
  addresses: [
    {
      id: "a1",
      label: "Maison",
      fullName: "Jean Kouassi",
      phone: "+225 07 07 12 34 56",
      zoneId: "cocody",
      details: "Riviera Palmeraie, rue I 45, villa 12",
      landmark: "Derrière la pharmacie Sainte Famille",
      isDefault: true,
    },
    {
      id: "a2",
      label: "Bureau",
      fullName: "Jean Kouassi",
      phone: "+225 05 05 98 76 54",
      zoneId: "plateau",
      details: "Immeuble Alpha 2000, 8e étage, bureau 812",
      landmark: "Avenue Chardy",
    },
    {
      id: "a3",
      label: "Parents",
      fullName: "Marie Kouassi",
      phone: "+225 01 02 03 04 05",
      zoneId: "bouake",
      details: "Quartier Commerce, près du grand marché",
    },
  ],
  billing: { company: "Kouassi Consulting", taxId: "1987654 A", address: "Riviera Palmeraie, rue I 45, Cocody — Abidjan" },
  twoFactor: false,
  newsletter: true,
  smsOptIn: true,
  whatsappOptIn: true,
};
