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
import {
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
const RECENT_BATCHES_PAGE_SIZE = 3;

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
  wastageQty: "",
  remarks: "",
};

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

export function ManufacturingEntryForm() {

  const [formData, setFormData] = useState(initialFormData)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentBatches, setRecentBatches] = useState<ManufacturingEntry[]>([]);
  const [recentBatchesPage, setRecentBatchesPage] = useState(1);

  const [rawMaterials, setRawMaterials] = useState([
    {
      rawMaterialName: "",
      packagingType: "",
      materialQuantity: "",
      materialUnit: "",
    },
  ]);

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

  const updateField = (name: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

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
  const isRecipeLocked = isTileAdhesiveProduct || selectedProductCategory === "Grout";
  const totalRecentBatchPages = Math.max(1, Math.ceil(recentBatches.length / RECENT_BATCHES_PAGE_SIZE));
  const visibleRecentBatches = recentBatches.slice(
    (recentBatchesPage - 1) * RECENT_BATCHES_PAGE_SIZE,
    recentBatchesPage * RECENT_BATCHES_PAGE_SIZE,
  );

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

    if (!selectedColor.trim()) {
      const message = "Color is required.";
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
                  value={formData.tphBatch}
                  onChange={(e) => {
                    const tphBatch = e.target.value;
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
                  }}
                >
                  <option value="" disabled>
                    Select TPH/Batch
                  </option>

                  <option value="1TPH">1TPH</option>
                  <option value="2TPH">2TPH</option>
                  <option value="Manual Blender">Manual Blender</option>
                  <option value="Sigma Mixer">Sigma Mixer</option>
                  <option value="Manual Hand Mixer">Manual Hand Mixer</option>
                </Select>
              </Field>

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
                  value={formData.productCategory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productCategory: e.target.value,
                      color: formData.tphBatch === "2TPH" ? "Gray" : formData.color,
                      finishedProductName: "",
                      bagSize: "",
                    })
                  }
                  disabled={
                    isProductCategoryLocked || !formData.tphBatch
                  }
                >
                  <option value="" disabled>
                    Select category
                  </option>

                  {productCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                htmlFor="finishedProductName"
                label="Finished Product Name"
              >
                {finishedProductOptions.length > 0 ? (
                  <Select
                    id="finishedProductName"
                    name="finishedProductName"
                    value={formData.finishedProductName}
                    onChange={(e) => updateField("finishedProductName", e.target.value)}
                  >
                    <option value="" disabled>Select Finished Product</option>
                    {finishedProductOptions.map((option) => (
                      <option key={option} value={option}>
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
                    onChange={(e) => updateField("finishedProductName", e.target.value)}
                  />
                )}
              </Field>

              <Field htmlFor="token" label="Token">
                <Select
                  id="token"
                  name="token"
                  value={formData.token}
                  onChange={(e) => updateField("token", e.target.value)}
                  disabled={!isTileAdhesiveProduct}
                >
                  {isTileAdhesiveProduct ? (
                    <>
                      <option value="" disabled>Select Token</option>
                      <option value="Coupan">Coupan</option>
                      <option value="Non-Coupan">Non-Coupan</option>
                    </>
                  ) : (
                    <option value="N/A">N/A</option>
                  )}
                </Select>
              </Field>

              <Field htmlFor="color" label="Color (auto-filled for TPH batches)">
                {colorOptions.length > 0 || isColorDisabled ? (
                  <Select
                    id="color"
                    name="color"
                    value={selectedColor || ""}
                    onChange={(e) => updateField("color", e.target.value)}
                    disabled={isColorDisabled}
                  >
                    <option value="" disabled>
                      Select Color
                    </option>
                    {isColorDisabled && selectedColor ? (
                      <option value={selectedColor}>{selectedColor}</option>
                    ) : null}
                    {colorOptions.map((option) => (
                      <option key={option} value={option}>
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
                    onChange={(e) => updateField("color", e.target.value)}
                  />
                )}
              </Field>
            </div>

            <div className="space-y-4">

              <h2 className="text-lg font-semibold">Raw Materials Used</h2>

              <hr className="my-0" />

              {rawMaterials.map((item, index) => (

                <div
                  key={index}
                  className="flex flex-col gap-4 rounded-md border p-4 md:flex-row md:items-end"
                >
                  <Field htmlFor={`rawMaterialName-${index}`} label="Raw Material">
                    <Input
                      id={`rawMaterialName-${index}`}
                      placeholder="e.g. Cement"
                      readOnly={isRecipeLocked}
                      value={item.rawMaterialName}
                      onChange={(e) =>
                        updateRawMaterialField(index, "rawMaterialName", e.target.value)
                      }
                    />
                  </Field>

                  <Field htmlFor={`packagingType-${index}`} label="Packaging Type">
                    <Input
                      id={`packagingType-${index}`}
                      placeholder="e.g. White, Premix"
                      readOnly={isRecipeLocked}
                      value={item.packagingType}
                      onChange={(e) =>
                        updateRawMaterialField(index, "packagingType", e.target.value)
                      }
                    />
                  </Field>

                  <Field htmlFor={`materialQuantity-${index}`} label="Material Quantity">
                    <Input
                      id={`materialQuantity-${index}`}
                      placeholder="e.g. 1000 kg"
                      readOnly={isRecipeLocked}
                      value={item.materialQuantity}
                      onChange={(e) =>
                        updateRawMaterialField(index, "materialQuantity", e.target.value)
                      }
                    />
                  </Field>

                  <Field htmlFor={`materialUnit-${index}`} label="Unit">
                    <Input
                      id={`materialUnit-${index}`}
                      placeholder="e.g. kg"
                      readOnly={isRecipeLocked}
                      value={item.materialUnit}
                      onChange={(e) =>
                        updateRawMaterialField(index, "materialUnit", e.target.value)
                      }
                    />
                  </Field>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor="bagSize" label="Bag Size">
                <Select
                  id="bagSize"
                  name="bagSize"
                  value={formData.bagSize}
                  onChange={(e) => {
                    const bagSize = e.target.value;

                    setFormData({
                      ...formData,
                      bagSize,
                      totalBagsProduced: getTotalBagsProduced(formData.tphBatch, bagSize),
                    });
                  }}
                >
                  <option value="" disabled>
                    Select Bag Size
                  </option>

                  {/* Bondure */}
                  {formData.productCategory === "Bondure" && (
                    <>
                      <option value="40kg">40KG</option>
                    </>
                  )}

                  {/* Epoxy */}
                  {formData.productCategory === "Epoxy" && (
                    <>
                      <option value="1kg">1KG</option>
                      <option value="5kg">5KG</option>
                    </>
                  )}

                  {/* Grout */}
                  {formData.productCategory === "Grout" && (
                    <>
                      <option value="1kg">1KG</option>
                    </>
                  )}

                  {/* Tile Cleaner */}
                  {formData.productCategory === "Tile Cleaner" && (
                    <>
                      <option value="1L">1L</option>
                      <option value="5L">5L</option>
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
                        <option value="20kg">20KG</option>
                        <option value="50kg">50KG</option>
                      </>
                    )}
                </Select>
              </Field>
              <Field htmlFor="totalBagsProduced" label="Total Bags Produced">
                <Input
                  id="totalBagsProduced"
                  name="totalBagsProduced"
                  min="0"
                  placeholder="0"
                  type="number"
                  value={formData.totalBagsProduced}
                  onChange={(e) => updateField("totalBagsProduced", e.target.value)}
                />
              </Field>
            </div>

            <Field htmlFor="wastageQty" label="Wastage Qty">
              <Input
                id="wastageQty"
                min="0"
                name="wastageQty"
                placeholder="Enter wastage quantity"
                step="0.01"
                type="number"
                value={formData.wastageQty}
                onChange={(e) => updateField("wastageQty", e.target.value)}
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

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Recent batches</CardTitle>
            <CardDescription>Latest production entries for this register.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
            {recentBatches.length > RECENT_BATCHES_PAGE_SIZE ? (
              <div className="flex items-center justify-between gap-2 border-t pt-3">
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
