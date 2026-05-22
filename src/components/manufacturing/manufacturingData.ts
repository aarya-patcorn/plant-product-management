export type RawMaterialRecipeItem = {
  rawMaterialName: string;
  packagingType: string;
  level2: string;
  level3: string;
  colorOfSandEpoxy: string;
  materialQuantity: string;
  materialUnit: string;
};

export const epoxyColors = [
  "Deep Safayar",
  "Light Gray",
  "Slate Gray",
  "Ivory",
  "White",
  "Coffee Brown",
  "Dark Gray",
  "Black",
  "Harvest Gold",
  "English Walnut",
  "Dhaulpur Pink",
  "Redwood",
];

export const groutProducts = [
  "300 kg White cement grout",
  "Ivory 300kg",
  "300 kg Black cement grout",
  "150 kg coffee brown grout",
  "150 kg light gray grout",
  "150 kg  gray grout",
  "150 kg RED grout",
  "150 kg BLUE grout",
  "150 kg GREEN grout",
  "150 kg YELLOW grout",
];

export const epoxyProducts = [
  "White epoxy",
  "Black epoxy",
  "Ivory epoxy",
  "Deep safayar epoxy",
  "Slate greyepoxy",
  "Light grey epoxy",
  "Dark grey epoxy",
  "Coffee brown epoxy",
  "Harvest Gold epoxy",
  "English walnut epoxy",
  "Dhaulpur pink epoxy",
  "Redwood epoxy",
];

export const epoxyProductColorMap: Record<string, string> = {
  "White epoxy": "White",
  "Black epoxy": "Black",
  "Ivory epoxy": "Ivory",
  "Deep safayar epoxy": "Deep Safayar",
  "Slate greyepoxy": "Slate Gray",
  "Light grey epoxy": "Light Gray",
  "Dark grey epoxy": "Dark Gray",
  "Coffee brown epoxy": "Coffee Brown",
  "Harvest Gold epoxy": "Harvest Gold",
  "English walnut epoxy": "English Walnut",
  "Dhaulpur pink epoxy": "Dhaulpur Pink",
  "Redwood epoxy": "Redwood",
};

export const groutProductColorMap: Record<string, string> = {
  "300 kg White cement grout": "White",
  "Ivory 300kg": "Ivory",
  "300 kg Black cement grout": "Black",
  "150 kg coffee brown grout": "Coffee Brown",
  "150 kg light gray grout": "Light Grey",
  "150 kg  gray grout": "Grey",
  "150 kg RED grout": "Red",
  "150 kg BLUE grout": "Blue",
  "150 kg GREEN grout": "Green",
  "150 kg YELLOW grout": "Yellow",
};

export const groutRecipes: Record<string, RawMaterialRecipeItem[]> = {
  "300 kg White cement grout": [
    { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "180", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Calcium Carbonate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "120", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "K50 Chemical", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "4", materialUnit: "kg" },
  ],
  "Ivory 300kg": [
    { rawMaterialName: "Ivory", packagingType: "White Cement", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "180", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Calcium Carbonate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "120", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "K50 Chemical", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "4", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Yellow Pigment", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "100", materialUnit: "gm" },
  ],
  "300 kg Black cement grout": [
    { rawMaterialName: "Cement", packagingType: "Grey", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "180", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Calcium Carbonate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "120", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "K50 Chemical", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "4", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Black Pigment", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "3500", materialUnit: "gm" },
  ],
  "150 kg coffee brown grout": [
    { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "70", materialUnit: "kg" },
    { rawMaterialName: "Cement", packagingType: "Grey", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "20", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Calcium Carbonate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "K50 Chemical", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "2", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Red Pigment", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "650", materialUnit: "gm" },
    { rawMaterialName: "Chemical", packagingType: "Black Pigment", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "700", materialUnit: "gm" },
  ],
  "150 kg light grey grout": [
    { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "20", materialUnit: "kg" },
    { rawMaterialName: "Cement", packagingType: "Grey", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "20", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Calcium Carbonate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "K50 Chemical", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "2", materialUnit: "kg" },
  ],
  "150 kg  grey grout": [
    { rawMaterialName: "Cement", packagingType: "Grey", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "70", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Calcium Carbonate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "K50 Chemical", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "2", materialUnit: "kg" },
  ],
  "150 kg RED grout": [
    { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "100", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Calcium Carbonate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "K50 Chemical", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "1.5", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Red Pigment", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "900", materialUnit: "gm" },
  ],
  "150 kg BLUE grout": [
    { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "100", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Calcium Carbonate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "K50 Chemical", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "1.5", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Blue Pigment", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "2000", materialUnit: "kg" },
  ],
  "150 kg GREEN grout": [
    { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "100", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Calcium Carbonate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "K50 Chemical", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "1.5", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Blue Pigment", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "1550", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Yellow Pigment", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "450", materialUnit: "gm" },
  ],
  "150 kg YELLOW grout": [
    { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "100", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Calcium Carbonate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "K50 Chemical", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "1.5", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Yellow Pigment", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "500", materialUnit: "gm" },
  ],
};

export const epoxyRecipes: Record<string, RawMaterialRecipeItem[]> = {
  "White": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "White", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Chemical", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
  "Black": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "Black", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Chemical", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
  "Ivory": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "Ivory", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Chemical", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
  "Deep Safayar": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "Blue", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Chemical", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
  "Slate Gray": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "Slate Gray", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Chemical", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
  "Light Gray": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "Light Gray", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Packaging", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
  "Dark Gray": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "Dark Gray", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Packaging", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
  "Coffee Brown": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "Coffee Brown", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Chemical", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
  "Harvest Gold": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "Jaisalmer", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Chemical", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
  "English Walnut": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "Sabal", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Chemical", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
  "Dhaulpur Pink": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "Savetrane", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Chemical", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
  "Redwood": [
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Resin", colorOfSandEpoxy: "", materialQuantity: "12.500", materialUnit: "kg" },
    { rawMaterialName: "Packaging", packagingType: "FG", level2: "Epoxy", level3: "Coloured Sand", colorOfSandEpoxy: "Terracotta", materialQuantity: "50", materialUnit: "kg" },
    { rawMaterialName: "Chemical", packagingType: "Byk", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
    { rawMaterialName: "Chemical", packagingType: "Benton", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "gm" },
  ],
};

export const tileCleanerRecipes: Record<string, RawMaterialRecipeItem[]> = {
  "Crystal X 1L": [
    { rawMaterialName: "Chemical", packagingType: "Normal Water", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "865", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Alcohol Ethoxylate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "60", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Sodium Gluconate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "25", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "2-Butoxyethanol", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "20", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Isopropyl Alcohol (IPA 99%)", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "20", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Benzalkonium Chloride (BKC)", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "5", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Premium Fragrance & Dye", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "5", materialUnit: "ml" },
  ],
  "Crystal X 5L": [
    { rawMaterialName: "Chemical", packagingType: "Normal Water", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "4325", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Alcohol Ethoxylate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "300", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Sodium Gluconate", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "125", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "2-Butoxyethanol", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "100", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Isopropyl Alcohol (IPA 99%)", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "100", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Benzalkonium Chloride (BKC)", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "25", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Premium Fragrance & Dye", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "25", materialUnit: "ml" },
  ],
  "Shine X 1L": [
    { rawMaterialName: "Chemical", packagingType: "Normal Water", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "810", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Urea (Technical Grade)", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "30", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Sulphamic Acid", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "35", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Hydrochloric Acid (32%)", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "25", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Citric Acid", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "20", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "2-Butoxyethanol", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "20", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Cocamidopropyl Betaine", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "35", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Alphox-200", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "20", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Xanthan Gum", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "3", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Fragrance & Dye", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "2", materialUnit: "ml" },
  ],
  "Shine X 5L": [
    { rawMaterialName: "Chemical", packagingType: "Normal Water", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "4050", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Urea (Technical Grade)", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "150", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Sulphamic Acid", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "175", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Hydrochloric Acid (32%)", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "125", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Citric Acid", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "100", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "2-Butoxyethanol", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "100", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Cocamidopropyl Betaine", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "175", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Alphox-200", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "100", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Xanthan Gum", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "15", materialUnit: "ml" },
    { rawMaterialName: "Chemical", packagingType: "Fragrance & Dye", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "10", materialUnit: "ml" },
  ],
};

export const tileAdhesiveRecipes: Record<string, Record<string, RawMaterialRecipeItem[]>> = {
  White: {
    "K90": [
      { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "275", materialUnit: "kg" },
      { rawMaterialName: "Sand", packagingType: "White", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "225", materialUnit: "kg" },
      { rawMaterialName: "Chemical", packagingType: "Premix", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "9", materialUnit: "kg" },
    ],
    "K80": [
      { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "225", materialUnit: "kg" },
      { rawMaterialName: "Sand", packagingType: "White", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "275", materialUnit: "kg" },
      { rawMaterialName: "Chemical", packagingType: "Premix", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "4.5", materialUnit: "kg" },
    ],
    "K60": [
      { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "225", materialUnit: "kg" },
      { rawMaterialName: "Sand", packagingType: "White", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "275", materialUnit: "kg" },
      { rawMaterialName: "Chemical", packagingType: "Premix", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "4.5", materialUnit: "kg" },
    ],
    "Kamdhenu X": [
      { rawMaterialName: "Cement", packagingType: "White Cement", level2: "Bag", level3: "", colorOfSandEpoxy: "", materialQuantity: "225", materialUnit: "kg" },
      { rawMaterialName: "Sand", packagingType: "White", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "275", materialUnit: "kg" },
      { rawMaterialName: "Chemical", packagingType: "Premix", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "4.5", materialUnit: "kg" },
    ],
  },
  Grey: {
    "K90": [
      { rawMaterialName: "Cement", packagingType: "OPC", level2: "Bulker", level3: "", colorOfSandEpoxy: "", materialQuantity: "550", materialUnit: "kg" },
      { rawMaterialName: "Sand", packagingType: "Grey", level2: "Small (600 micron)", level3: "", colorOfSandEpoxy: "", materialQuantity: "450", materialUnit: "kg" },
      { rawMaterialName: "Chemical", packagingType: "Premix", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "18", materialUnit: "kg" },
    ],
    "K80": [
      { rawMaterialName: "Cement", packagingType: "PPC", level2: "Bags", level3: "", colorOfSandEpoxy: "", materialQuantity: "450", materialUnit: "kg" },
      { rawMaterialName: "Sand", packagingType: "Grey", level2: "Small (600 micron)", level3: "", colorOfSandEpoxy: "", materialQuantity: "550", materialUnit: "kg" },
      { rawMaterialName: "Chemical", packagingType: "Premix", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "9", materialUnit: "kg" },
    ],
    "K60": [
      { rawMaterialName: "Cement", packagingType: "PPC", level2: "Bags", level3: "", colorOfSandEpoxy: "", materialQuantity: "450", materialUnit: "kg" },
      { rawMaterialName: "Sand", packagingType: "Grey", level2: "Small (600 micron)", level3: "", colorOfSandEpoxy: "", materialQuantity: "550", materialUnit: "kg" },
      { rawMaterialName: "Chemical", packagingType: "Premix", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "9", materialUnit: "kg" },
    ],
    "K50": [
      { rawMaterialName: "Cement", packagingType: "PPC", level2: "Bags", level3: "", colorOfSandEpoxy: "", materialQuantity: "400", materialUnit: "kg" },
      { rawMaterialName: "Sand", packagingType: "Grey", level2: "Small (600 micron)", level3: "", colorOfSandEpoxy: "", materialQuantity: "600", materialUnit: "kg" },
      { rawMaterialName: "Chemical", packagingType: "Premix", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "4", materialUnit: "kg" },
    ],
    "Kamdhenu X": [
      { rawMaterialName: "Cement", packagingType: "OPC", level2: "Bulker", level3: "", colorOfSandEpoxy: "", materialQuantity: "500", materialUnit: "kg" },
      { rawMaterialName: "Sand", packagingType: "Grey", level2: "Small (600 micron)", level3: "", colorOfSandEpoxy: "", materialQuantity: "450", materialUnit: "kg" },
      { rawMaterialName: "Chemical", packagingType: "Premix", level2: "", level3: "", colorOfSandEpoxy: "", materialQuantity: "36", materialUnit: "kg" },
    ],
  },
};
