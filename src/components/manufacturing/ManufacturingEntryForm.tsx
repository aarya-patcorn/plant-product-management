import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ClipboardCheck, Eye, Factory, RotateCcw, Save } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchManufacturingEntries, submitSheetEntry, type ManufacturingEntry } from "@/lib/googleSheetApi";
import { sanitizeNumberOnly, sanitizeTextOnly } from "@/lib/inputValidation";
import {
  bondureRecipes,
  epoxyColors,
  epoxyProductColorMap,
  epoxyProducts,
  epoxyRecipes,
  groutProductColorMap,
  groutProducts,
  groutRecipes,
  tileAdhesiveRecipes,
  tileCleanerRecipes,
} from "@/components/manufacturing/manufacturingData";

const productCategories = ["Tile Adhesive", "Bondure", "Epoxy", "Grout", "Tile Cleaner", "Other"];
const unitOptions = ["kg", "g", "ltr", "ml", "pcs", "bags"];
const groutColors = ["Black", "White", "Ivory", "Coffee Brown", "Gray", "Light Gray", "Green", "Blue", "Red", "Yellow"];

const tileAdhesiveWhiteProducts = ["K60", "K80", "K90", "Kamdhenu X"];
const tileAdhesiveGrayProducts = ["K50", "K60", "K80", "K90", "Kamdhenu X"];
const tileCleanerProducts = ["Crystal X 1L", "Shine X 1L", "Crystal X 5L", "Shine X 5L"];
const MOBILE_RECENT_BATCHES_PAGE_SIZE = 3;
const DESKTOP_RECENT_BATCHES_PAGE_SIZE = 8;
const OTHER_OPTION = "__other__";
const manufacturingOtherFields = [
  "tphBatch",
  "productCategory",
  "finishedProductName",
  "token",
  "color",
  "bagSize",
] as const;
type ManufacturingOtherField = (typeof manufacturingOtherFields)[number];

const initialFormData = {
  productionDate: "",
  tphBatch: "",
  batchNo: "",
  productCategory: "",
  materialQuantity: "",
  materialUnit: "",
  token: "",
  color: "",
  finishedProductName: "",
  bagSize: "",
  totalBagsProduced: "",
  sticker: "",
  sponge: "",
  wastageQty: "",
  wastageReason: "",
  remarks: "",
};

const initialRawMaterials = [
  {
    rawMaterialName: "",
    packagingType: "",
    materialQuantity: "",
    materialUnit: "",
  },
];

const getTotalBagsProduced = (tphBatch: string, bagSize: string) => {
  if (tphBatch === "2TPH" && bagSize === "20kg") return "50";
  if (tphBatch === "2TPH" && bagSize === "50kg") return "20";

  if (tphBatch === "1TPH" && bagSize === "20kg") return "25";
  if (tphBatch === "1TPH" && bagSize === "50kg") return "10";

  return "";
};

const getBatchDefaults = (tphBatch: string) => {
  switch (tphBatch) {
    case "1TPH":
      return {
        productCategory: "Tile Adhesive",
        color: "White",
      };
    case "2TPH":
      return {
        productCategory: "",
        color: "Gray",
      };
    case "Manual Blender":
      return {
        productCategory: "Grout",
        color: "",
      };
    case "Sigma Mixer":
      return {
        productCategory: "Epoxy",
        color: "",
      };
    case "Manual Hand Mixer":
      return {
        productCategory: "Tile Cleaner",
        color: "",
      };
    default:
      return {
        productCategory: "",
        color: "",
      };
  }
};

function isPositiveNumber(value: string) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0;
}

function isNonNegativeNumber(value: string) {
  if (!value.trim()) {
    return true;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue >= 0;
}


function Field({
  children,
  className,
  htmlFor,
  label,
}: {
  children: ReactNode;
  className?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const initialManufacturingOtherState = Object.fromEntries(
  manufacturingOtherFields.map((field) => [field, false]),
) as Record<ManufacturingOtherField, boolean>;

function getOptionsWithOther(options: string[]) {
  const normalizedOptions = options.filter((option) => option.toLowerCase() !== "other" && option.toLowerCase() !== "others");
  return [...normalizedOptions, "Other"];
}

export function ManufacturingEntryForm() {

  const [formData, setFormData] = useState(initialFormData)
  const [otherSelections, setOtherSelections] = useState(initialManufacturingOtherState);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentBatches, setRecentBatches] = useState<ManufacturingEntry[]>([]);
  const [recentBatchesPage, setRecentBatchesPage] = useState(1);
  const [recentBatchesPageSize, setRecentBatchesPageSize] = useState(() =>
    typeof window !== "undefined" && window.innerWidth >= 1024
      ? DESKTOP_RECENT_BATCHES_PAGE_SIZE
      : MOBILE_RECENT_BATCHES_PAGE_SIZE,
  );

  const [rawMaterials, setRawMaterials] = useState(initialRawMaterials);

  const updateRawMaterialField = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...rawMaterials];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setRawMaterials(updated);
  };

  const updateRawMaterialTextField = (index: number, field: string, value: string) => {
    updateRawMaterialField(index, field, sanitizeTextOnly(value));
  };

  const updateRawMaterialNumberField = (index: number, field: string, value: string) => {
    updateRawMaterialField(index, field, sanitizeNumberOnly(value, { allowDecimal: true }));
  };

  const updateField = (name: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateTextField = (name: keyof typeof formData, value: string) => {
    updateField(name, sanitizeTextOnly(value));
  };

  const updateNumberField = (name: keyof typeof formData, value: string, options?: { allowDecimal?: boolean }) => {
    updateField(name, sanitizeNumberOnly(value, options));
  };

  const getSelectValue = (field: ManufacturingOtherField, value: string) =>
    otherSelections[field] ? OTHER_OPTION : value;

  const handleSelectChange = (
    field: ManufacturingOtherField,
    value: string,
    fieldsToClear: ManufacturingOtherField[] = [],
    extraUpdates: Partial<typeof initialFormData> = {},
  ) => {
    const isOtherSelection = value === OTHER_OPTION;

    setOtherSelections((current) => {
      const next = { ...current, [field]: isOtherSelection };
      fieldsToClear.forEach((fieldName) => {
        next[fieldName] = false;
      });
      return next;
    });

    setFormData((current) => {
      const next = { ...current, ...extraUpdates };
      fieldsToClear.forEach((fieldName) => {
        next[fieldName] = "";
      });
      next[field] = isOtherSelection ? "" : value;
      return next;
    });
  };

  const renderOtherInput = (field: ManufacturingOtherField, label: string, placeholder: string) =>
    otherSelections[field] ? (
      <Field htmlFor={`${field}-other`} label={`${label} (Other)`}>
        <Input
          id={`${field}-other`}
          value={formData[field]}
          placeholder={placeholder}
          onChange={(e) => updateTextField(field, e.target.value)}
        />
      </Field>
    ) : null;

  const selectedColor =
    formData.tphBatch === "1TPH"
      ? "White"
      : formData.tphBatch === "2TPH"
        ? "Gray"
        : formData.color;

  const selectedProductCategory = formData.productCategory;
  const isTileAdhesiveProduct = selectedProductCategory === "Tile Adhesive";
  const productCategoryOptions =
    formData.tphBatch === "2TPH" ? ["Tile Adhesive", "Bondure"] : productCategories;
  const isProductCategoryLocked = ["1TPH", "Manual Blender", "Sigma Mixer", "Manual Hand Mixer"].includes(
    formData.tphBatch,
  );
  const colorOptions =
    formData.tphBatch === "Manual Blender"
      ? groutColors
      : formData.tphBatch === "Sigma Mixer"
        ? epoxyColors
        : [];
  const isColorDisabled =
    ["1TPH", "2TPH", "Manual Hand Mixer"].includes(formData.tphBatch) ||
    isTileAdhesiveProduct ||
    selectedProductCategory === "Grout";
  const finishedProductOptions =
    formData.tphBatch === "Manual Hand Mixer"
      ? tileCleanerProducts
      : selectedProductCategory === "Grout"
        ? groutProducts
        : selectedProductCategory === "Epoxy"
          ? epoxyProducts
          : isTileAdhesiveProduct && selectedColor === "White"
            ? tileAdhesiveWhiteProducts
            : isTileAdhesiveProduct && selectedColor === "Gray"
              ? tileAdhesiveGrayProducts
              : [];
  const bagSizeLabel =
    formData.productCategory === "Epoxy"
      ? "Bucket Size"
      : formData.productCategory === "Tile Cleaner"
        ? "Can Size"
        : formData.productCategory === "Grout"
          ? "Pouch Size"
          : "Bag Size";
  const isRecipeLocked =
    isTileAdhesiveProduct ||
    selectedProductCategory === "Bondure" ||
    selectedProductCategory === "Grout";
  const totalRecentBatchPages = Math.max(1, Math.ceil(recentBatches.length / recentBatchesPageSize));
  const visibleRecentBatches = recentBatches.slice(
    (recentBatchesPage - 1) * recentBatchesPageSize,
    recentBatchesPage * recentBatchesPageSize,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updatePageSize = () =>
      setRecentBatchesPageSize(
        mediaQuery.matches ? DESKTOP_RECENT_BATCHES_PAGE_SIZE : MOBILE_RECENT_BATCHES_PAGE_SIZE,
      );

    updatePageSize();
    mediaQuery.addEventListener("change", updatePageSize);

    return () => mediaQuery.removeEventListener("change", updatePageSize);
  }, []);

  useEffect(() => {
    let isMounted = true;

    void fetchManufacturingEntries()
      .then((entries) => {
        if (!isMounted) {
          return;
        }

        const sortedEntries = [...entries].sort((left, right) =>
          `${right.productionDate} ${right.batchNo}`.localeCompare(`${left.productionDate} ${left.batchNo}`),
        );
        setRecentBatches(sortedEntries);
      })
      .catch(() => {
        if (isMounted) {
          setRecentBatches([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (recentBatchesPage > totalRecentBatchPages) {
      setRecentBatchesPage(totalRecentBatchPages);
    }
  }, [recentBatchesPage, totalRecentBatchPages]);

  useEffect(() => {
    const productName = formData.finishedProductName?.replace(" (Coupan)", "");

    if (
      selectedProductCategory !== "Tile Adhesive" ||
      !selectedColor ||
      !productName
    ) {
      return;
    }

    const recipeColor = selectedColor === "Gray" ? "Grey" : selectedColor;
    const recipe = tileAdhesiveRecipes[recipeColor]?.[productName];

    if (!recipe) return;

    setRawMaterials(recipe);
  }, [selectedProductCategory, selectedColor, formData.finishedProductName]);

  useEffect(() => {
    if (selectedProductCategory !== "Bondure") {
      return;
    }

    setRawMaterials(bondureRecipes);
  }, [selectedProductCategory]);

  useEffect(() => {
    if (selectedProductCategory !== "Grout" || !formData.finishedProductName) {
      return;
    }

    const recipe = groutRecipes[formData.finishedProductName];

    if (!recipe) {
      return;
    }

    setRawMaterials(recipe);
  }, [selectedProductCategory, formData.finishedProductName]);

  useEffect(() => {
    if (selectedProductCategory !== "Epoxy" || !selectedColor) {
      return;
    }

    const recipe = epoxyRecipes[selectedColor];

    if (!recipe) {
      return;
    }

    setRawMaterials(recipe);
  }, [selectedProductCategory, selectedColor]);

  useEffect(() => {
    if (selectedProductCategory !== "Tile Cleaner" || !formData.finishedProductName) {
      return;
    }

    const recipe = tileCleanerRecipes[formData.finishedProductName];

    if (!recipe) {
      return;
    }

    setRawMaterials(recipe);
  }, [selectedProductCategory, formData.finishedProductName]);

  useEffect(() => {
    setFormData((current) => {
      if (isTileAdhesiveProduct) {
        return current.token === "N/A" ? { ...current, token: "" } : current;
      }

      return current.token === "N/A" ? current : { ...current, token: "N/A" };
    });
  }, [isTileAdhesiveProduct]);

  useEffect(() => {
    if (selectedProductCategory !== "Grout") {
      return;
    }

    const mappedColor = groutProductColorMap[formData.finishedProductName];

    if (!mappedColor || formData.color === mappedColor) {
      return;
    }

    setFormData((current) => ({
      ...current,
      color: mappedColor,
    }));
  }, [selectedProductCategory, formData.finishedProductName, formData.color]);

  useEffect(() => {
    if (selectedProductCategory !== "Epoxy") {
      return;
    }

    const mappedColor = epoxyProductColorMap[formData.finishedProductName];

    if (!mappedColor || formData.color === mappedColor) {
      return;
    }

    setFormData((current) => ({
      ...current,
      color: mappedColor,
    }));
  }, [selectedProductCategory, formData.finishedProductName, formData.color]);

  useEffect(() => {
    if (selectedProductCategory !== "Tile Cleaner") {
      return;
    }

    const mappedBagSize =
      formData.finishedProductName === "Crystal X 1L" || formData.finishedProductName === "Shine X 1L"
        ? "1L"
        : formData.finishedProductName === "Crystal X 5L" || formData.finishedProductName === "Shine X 5L"
          ? "5L"
          : "";

    if (!mappedBagSize || formData.bagSize === mappedBagSize) {
      return;
    }

    setFormData((current) => ({
      ...current,
      bagSize: mappedBagSize,
    }));
  }, [selectedProductCategory, formData.finishedProductName, formData.bagSize]);

  useEffect(() => {
    if (selectedProductCategory !== "Epoxy") {
      setFormData((current) =>
        current.sticker || current.sponge ? { ...current, sticker: "", sponge: "" } : current,
      );
      return;
    }

    const hiddenPackagingValue = formData.totalBagsProduced.trim();

    setFormData((current) =>
      current.sticker === hiddenPackagingValue && current.sponge === hiddenPackagingValue
        ? current
        : {
          ...current,
          sticker: hiddenPackagingValue,
          sponge: hiddenPackagingValue,
        },
    );
  }, [selectedProductCategory, formData.totalBagsProduced]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("idle");
    setSubmitMessage("");

    if (!formData.productionDate) {
      const message = "Production date is required.";
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    if (!formData.tphBatch) {
      const message = "TPH / Batch is required.";
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    if (!formData.batchNo.trim()) {
      const message = "Batch No. is required.";
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    if (!selectedProductCategory.trim()) {
      const message = "Product category is required.";
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    if (!formData.finishedProductName.trim()) {
      const message = "Finished product name is required.";
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    if (isTileAdhesiveProduct && !formData.token) {
      const message = "Token is required for tile adhesive batches.";
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    if (!formData.bagSize) {
      const message = "Bag size is required.";
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    if (!isPositiveNumber(formData.totalBagsProduced)) {
      const message = "Total bags produced must be greater than 0.";
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    if (!isNonNegativeNumber(formData.wastageQty)) {
      const message = "Wastage qty must be 0 or more.";
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    if (rawMaterials.length === 0) {
      const message = "At least one raw material is required.";
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    const invalidMaterialIndex = rawMaterials.findIndex((item) =>
      !item.rawMaterialName.trim() ||
      !item.packagingType.trim() ||
      !isPositiveNumber(item.materialQuantity) ||
      !item.materialUnit.trim(),
    );

    if (invalidMaterialIndex !== -1) {
      const message = `Raw material row ${invalidMaterialIndex + 1} is incomplete or invalid.`;
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitSheetEntry("manufacturing", {
        ...formData,
        color: selectedColor,
        productCategory: selectedProductCategory,
        sticker: selectedProductCategory === "Epoxy" ? formData.sticker : "",
        sponge: selectedProductCategory === "Epoxy" ? formData.sponge : "",
        rawMaterials,
      });

      const responseMessage =
        response && typeof response === "object" && "message" in response
          ? String(response.message ?? "")
          : "";

      const hasUnavailableStockMessage =
        /stock.*(unavailable|not available|insufficient)|insufficient.*stock|out of stock/i.test(responseMessage);

      if (hasUnavailableStockMessage) {
        setSubmitStatus("error");
        setSubmitMessage(responseMessage);
        toast.error(responseMessage);
        return;
      }

      setFormData(initialFormData);
      setOtherSelections(initialManufacturingOtherState);
      setRawMaterials(initialRawMaterials);
      toast.success("Production entry saved successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save production entry.";
      setSubmitStatus("error");
      setSubmitMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="min-w-0">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>Production entry form</CardTitle>
            <CardDescription>Record production batches, material usage, output, bags, and wastage.</CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link to="/manufacturing-entries">
              <Eye />
              View Entries
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-5"
            onReset={() => {
              setFormData(initialFormData);
              setOtherSelections(initialManufacturingOtherState);
              setRawMaterials(initialRawMaterials);
              setSubmitStatus("idle");
              setSubmitMessage("");
            }}
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field htmlFor="productionDate" label="Production Date">
                <Input
                  id="productionDate"
                  name="productionDate"
                  type="date"
                  value={formData.productionDate}
                  onChange={(e) => updateField("productionDate", e.target.value)}
                />
              </Field>

              <Field htmlFor="tphBatch" label="TPH / Batch">
                <Select
                  id="tphBatch"
                  name="tphBatch"
                  value={getSelectValue("tphBatch", formData.tphBatch)}
                  onChange={(e) => {
                    const tphBatch = e.target.value;
                    const isOtherSelection = tphBatch === OTHER_OPTION;

                    setOtherSelections((current) => ({
                      ...current,
                      tphBatch: isOtherSelection,
                      productCategory: false,
                      finishedProductName: false,
                      bagSize: false,
                      token: false,
                      color: false,
                    }));

                    if (isOtherSelection) {
                      setFormData({
                        ...formData,
                        tphBatch: "",
                        productCategory: "",
                        color: "",
                        finishedProductName: "",
                        bagSize: "",
                        token: "",
                      });
                      setRawMaterials(initialRawMaterials);
                      return;
                    }

                    const defaults = getBatchDefaults(tphBatch);

                    setFormData({
                      ...formData,
                      tphBatch,
                      productCategory: defaults.productCategory,
                      color: defaults.color,
                      finishedProductName: "",
                      bagSize: "",
                      token: defaults.productCategory === "Tile Adhesive" ? "" : "N/A",
                    });
                    setRawMaterials(initialRawMaterials);
                  }}
                >
                  <option value="" disabled>
                    Select TPH/Batch
                  </option>

                  {getOptionsWithOther(["1TPH", "2TPH", "Manual Blender", "Sigma Mixer", "Manual Hand Mixer"]).map((option) => (
                    <option key={option} value={option === "Other" ? OTHER_OPTION : option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
              {renderOtherInput("tphBatch", "TPH / Batch", "Enter batch type")}

              <Field htmlFor="batchNo" label="Batch No.">
                <Input
                  id="batchNo"
                  name="batchNo"
                  placeholder="e.g. B-2405-018"
                  value={formData.batchNo}
                  onChange={(e) => updateField("batchNo", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor="productCategory" label="Product Category">
                <Select
                  id="productCategory"
                  name="productCategory"
                  value={getSelectValue("productCategory", formData.productCategory)}
                  onChange={(e) => {
                    const value = e.target.value;
                    const isOtherSelection = value === OTHER_OPTION;

                    setOtherSelections((current) => ({
                      ...current,
                      productCategory: isOtherSelection,
                      finishedProductName: false,
                      bagSize: false,
                      color: false,
                    }));

                    setFormData({
                      ...formData,
                      productCategory: isOtherSelection ? "" : value,
                      color: isOtherSelection ? "" : formData.tphBatch === "2TPH" ? "Gray" : formData.color,
                      finishedProductName: "",
                      bagSize: "",
                    });
                    setRawMaterials(initialRawMaterials);
                  }}
                  disabled={
                    isProductCategoryLocked || !formData.tphBatch
                  }
                >
                  <option value="" disabled>
                    Select category
                  </option>

                  {getOptionsWithOther(productCategoryOptions).map((option) => (
                    <option key={option} value={option === "Other" ? OTHER_OPTION : option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
              {renderOtherInput("productCategory", "Product Category", "Enter product category")}
              <Field
                htmlFor="finishedProductName"
                label="Finished Product Name"
              >
                {finishedProductOptions.length > 0 ? (
                  <Select
                    id="finishedProductName"
                    name="finishedProductName"
                    value={getSelectValue("finishedProductName", formData.finishedProductName)}
                    onChange={(e) => {
                      handleSelectChange("finishedProductName", e.target.value);
                      setRawMaterials(initialRawMaterials);
                    }}
                  >
                    <option value="" disabled>Select Finished Product</option>
                    {getOptionsWithOther(finishedProductOptions).map((option) => (
                      <option key={option} value={option === "Other" ? OTHER_OPTION : option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id="finishedProductName"
                    name="finishedProductName"
                    placeholder="Enter finished product"
                    value={formData.finishedProductName}
                    onChange={(e) => updateTextField("finishedProductName", e.target.value)}
                  />
                )}
              </Field>
              {finishedProductOptions.length > 0 &&
                renderOtherInput("finishedProductName", "Finished Product Name", "Enter finished product")}

              <Field htmlFor="token" label="Token">
                <Select
                  id="token"
                  name="token"
                  value={getSelectValue("token", formData.token)}
                  onChange={(e) => handleSelectChange("token", e.target.value)}
                  disabled={!isTileAdhesiveProduct}
                >
                  {isTileAdhesiveProduct ? (
                    <>
                      <option value="" disabled>Select Token</option>
                      {getOptionsWithOther(["Coupan", "Non-Coupan"]).map((option) => (
                        <option key={option} value={option === "Other" ? OTHER_OPTION : option}>
                          {option}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="N/A">N/A</option>
                  )}
                </Select>
              </Field>
              {isTileAdhesiveProduct && renderOtherInput("token", "Token", "Enter token")}

              <Field htmlFor="color" label="Color (auto-filled for TPH batches)">
                {colorOptions.length > 0 || isColorDisabled ? (
                  <Select
                    id="color"
                    name="color"
                    value={getSelectValue("color", selectedColor || "")}
                    onChange={(e) => handleSelectChange("color", e.target.value)}
                    disabled={isColorDisabled}
                  >
                    <option value="" disabled>
                      Select Color
                    </option>
                    {isColorDisabled && selectedColor ? (
                      <option value={selectedColor}>{selectedColor}</option>
                    ) : null}
                    {getOptionsWithOther(colorOptions).map((option) => (
                      <option key={option} value={option === "Other" ? OTHER_OPTION : option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id="color"
                    name="color"
                    placeholder="e.g. Gray, White, etc."
                    value={selectedColor || ""}
                    onChange={(e) => updateTextField("color", e.target.value)}
                  />
                )}
              </Field>
              {colorOptions.length > 0 && !isColorDisabled && renderOtherInput("color", "Color", "Enter color")}
            </div>

            <div className="space-y-4">

              <h2 className="text-lg font-semibold">Raw Materials Used</h2>

              <hr className="my-0" />

              {rawMaterials.map((item, index) => (

                <div
                  key={index}
                  className="flex flex-col gap-4 rounded-md border p-4 md:items-end xl:grid xl:grid-cols-4"
                >
                  <Field className="min-w-0" htmlFor={`rawMaterialName-${index}`} label="Raw Material">
                    <Input
                      className="w-full"
                      id={`rawMaterialName-${index}`}
                      placeholder="e.g. Cement"
                      readOnly={isRecipeLocked}
                      value={item.rawMaterialName}
                      onChange={(e) =>
                        updateRawMaterialTextField(index, "rawMaterialName", e.target.value)
                      }
                    />
                  </Field>

                  <Field className="min-w-0" htmlFor={`packagingType-${index}`} label="Packaging Type">
                    <Input
                      className="w-full"
                      id={`packagingType-${index}`}
                      placeholder="e.g. White, Premix"
                      readOnly={isRecipeLocked}
                      value={item.packagingType}
                      onChange={(e) =>
                        updateRawMaterialTextField(index, "packagingType", e.target.value)
                      }
                    />
                  </Field>

                  <Field className="min-w-0" htmlFor={`materialQuantity-${index}`} label="Material Quantity">
                    <Input
                      className="w-full"
                      id={`materialQuantity-${index}`}
                      placeholder="e.g. 1000 kg"
                      readOnly={isRecipeLocked}
                      value={item.materialQuantity}
                      onChange={(e) =>
                        updateRawMaterialNumberField(index, "materialQuantity", e.target.value)
                      }
                    />
                  </Field>

                  <Field className="min-w-0" htmlFor={`materialUnit-${index}`} label="Unit">
                    <Input
                      className="w-full"
                      id={`materialUnit-${index}`}
                      placeholder="e.g. kg"
                      readOnly={isRecipeLocked}
                      value={item.materialUnit}
                      onChange={(e) =>
                        updateRawMaterialTextField(index, "materialUnit", e.target.value)
                      }
                    />
                  </Field>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field htmlFor="bagSize" label={bagSizeLabel}>
                <Select
                  id="bagSize"
                  name="bagSize"
                  value={getSelectValue("bagSize", formData.bagSize)}
                  onChange={(e) => {
                    const bagSize = e.target.value;
                    const isOtherSelection = bagSize === OTHER_OPTION;

                    setOtherSelections((current) => ({
                      ...current,
                      bagSize: isOtherSelection,
                    }));

                    setFormData({
                      ...formData,
                      bagSize: isOtherSelection ? "" : bagSize,
                      totalBagsProduced: isOtherSelection ? "" : getTotalBagsProduced(formData.tphBatch, bagSize),
                    });
                  }}
                >
                  <option value="" disabled>
                    Select {bagSizeLabel}
                  </option>

                  {/* Bondure */}
                  {formData.productCategory === "Bondure" && (
                    <>
                      {getOptionsWithOther(["40kg"]).map((option) => (
                        <option key={option} value={option === "Other" ? OTHER_OPTION : option}>
                          {option === "40kg" ? "40KG" : option}
                        </option>
                      ))}
                    </>
                  )}

                  {/* Epoxy */}
                  {formData.productCategory === "Epoxy" && (
                    <>
                      {getOptionsWithOther(["1kg", "5kg"]).map((option) => (
                        <option key={option} value={option === "Other" ? OTHER_OPTION : option}>
                          {option === "1kg" ? "1KG" : option === "5kg" ? "5KG" : option}
                        </option>
                      ))}
                    </>
                  )}

                  {/* Grout */}
                  {formData.productCategory === "Grout" && (
                    <>
                      {getOptionsWithOther(["Pouch 1KG"]).map((option) => (
                        <option key={option} value={option === "Other" ? OTHER_OPTION : option}>
                          {option === "Pouch 1KG" ? "1KG" : option}
                        </option>
                      ))}
                    </>
                  )}

                  {/* Tile Cleaner */}
                  {formData.productCategory === "Tile Cleaner" && (
                    <>
                      {getOptionsWithOther(["1L", "5L"]).map((option) => (
                        <option key={option} value={option === "Other" ? OTHER_OPTION : option}>
                          {option}
                        </option>
                      ))}
                    </>
                  )}

                  {/* Default */}
                  {![
                    "Bondure",
                    "Epoxy",
                    "Grout",
                    "Tile Cleaner",
                  ].includes(formData.productCategory) && (
                      <>
                        {getOptionsWithOther(["20kg", "50kg"]).map((option) => (
                          <option key={option} value={option === "Other" ? OTHER_OPTION : option}>
                            {option === "20kg" ? "20KG" : option === "50kg" ? "50KG" : option}
                          </option>
                        ))}
                      </>
                    )}
                </Select>
              </Field>
              {renderOtherInput("bagSize", bagSizeLabel, `Enter ${bagSizeLabel.toLowerCase()}`)}
              <Field htmlFor="totalBagsProduced" label="Total Bags Produced">
                <Input
                  id="totalBagsProduced"
                  name="totalBagsProduced"
                  min="0"
                  placeholder="0"
                  type="number"
                  value={formData.totalBagsProduced}
                  onChange={(e) => updateNumberField("totalBagsProduced", e.target.value, { allowDecimal: true })}
                />
              </Field>

              <Field htmlFor="wastageQty" label="Wastage Qty">
                <Input
                  id="wastageQty"
                  min="0"
                  name="wastageQty"
                  placeholder="Enter wastage quantity"
                  step="0.01"
                  type="number"
                  value={formData.wastageQty}
                  onChange={(e) => updateNumberField("wastageQty", e.target.value, { allowDecimal: true })}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <Field htmlFor="wastageReason" label="Wastage Reason">
                <Textarea
                  id="wastageReason"
                  name="wastageReason"
                  placeholder="Add reason for wastage"
                  value={formData.wastageReason}
                  onChange={(e) => updateField("wastageReason", e.target.value)}
                />
              </Field>

              <Field htmlFor="remarks" label="Remarks">
                <Textarea
                  id="remarks"
                  name="remarks"
                  placeholder="Add notes about batch quality, downtime, shortage, or rework"
                  value={formData.remarks}
                  onChange={(e) => updateField("remarks", e.target.value)}
                />
              </Field>
            </div>


            {formData.productCategory === "Epoxy" && (
              <>
                <input name="sticker" type="hidden" value={formData.sticker} />
                <input name="sponge" type="hidden" value={formData.sponge} />
              </>
            )}

            <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
              {submitStatus === "error" && submitMessage && (
                <p
                  className="text-sm font-medium text-destructive sm:mr-auto"
                >
                  {submitMessage}
                </p>
              )}
              <Button disabled={isSubmitting} type="reset" variant="outline">
                <RotateCcw />
                Reset
              </Button>
              <Button disabled={isSubmitting} type="submit">
                <Save />
                {isSubmitting ? "Saving..." : "Save production"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-5 xl:sticky xl:top-5 xl:h-[calc(90vh-1rem)]">
        <Card className="xl:flex xl:h-full xl:flex-col">
          <CardHeader>
            <CardTitle>Recent batches</CardTitle>
            <CardDescription>Latest production entries for this register.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 xl:flex-1 xl:overflow-y-auto">
            {visibleRecentBatches.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No production entries available yet.
              </div>
            ) : (
              visibleRecentBatches.map((batch) => (
                <div className="rounded-md border p-3" key={batch.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{batch.finishedProductName || "Production entry"}</p>
                    <span className="text-xs text-muted-foreground">{batch.batchNo || batch.id}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[batch.totalBagsProduced, "bags"].filter(Boolean).join(" ")} produced in {batch.productCategory || "-"}
                  </p>
                </div>
              )))}
            {recentBatches.length > recentBatchesPageSize ? (
              <div className="flex items-center justify-between gap-2 border-t pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecentBatchesPage((page) => Math.max(1, page - 1))}
                  disabled={recentBatchesPage === 1}
                >
                  Prev
                </Button>
                <span className="text-xs text-muted-foreground">
                  {recentBatchesPage} / {totalRecentBatchPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecentBatchesPage((page) => Math.min(totalRecentBatchPages, page + 1))}
                  disabled={recentBatchesPage === totalRecentBatchPages}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
