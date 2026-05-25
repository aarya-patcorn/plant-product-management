import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ClipboardList, Eye, RotateCcw, Save, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { sanitizeNumberOnly, sanitizeTextOnly } from "@/lib/inputValidation";
import {
  fetchDispatchEntries,
  fetchProductionMaterialLogs,
  submitSheetEntry,
  type DispatchEntry,
  type ProductionMaterialLog,
} from "@/lib/googleSheetApi";

const RECENT_DEPARTURES_PAGE_SIZE = 3;
const OTHER_OPTION = "__other__";
const dispatchOtherFields = ["productCategory", "productName", "token", "productColor", "bagSize"] as const;
type DispatchOtherField = (typeof dispatchOtherFields)[number];

const initialFormData = {
  date: "",
  time: "",
  challanNo: "",
  challanName: "",
  vehicleNo: "",
  driverName: "",
  driverContact: "",
  dispatchTime: "",
  dispatchSite: "",
  todayVehicleNo: "",
  token: "",
  productCategory: "",
  bagSize: "",
  productColor: "",
  productName: "",
  quantity: "",
  totalBags: "",
};

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

const initialDispatchOtherState = Object.fromEntries(
  dispatchOtherFields.map((field) => [field, false]),
) as Record<DispatchOtherField, boolean>;

function getOptionsWithOther(options: string[]) {
  const normalizedOptions = options.filter((option) => option.toLowerCase() !== "other" && option.toLowerCase() !== "others");
  return [...normalizedOptions, "Other"];
}

function isPositiveNumber(value: string) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0;
}

function isDigitsOnly(value: string) {
  return /^\d+$/.test(value.trim());
}

export function ProductDepartureForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [otherSelections, setOtherSelections] = useState(initialDispatchOtherState);
  const [productionEntries, setProductionEntries] = useState<ProductionMaterialLog[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productLoadError, setProductLoadError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentDepartures, setRecentDepartures] = useState<DispatchEntry[]>([]);
  const [recentDeparturesPage, setRecentDeparturesPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    void fetchProductionMaterialLogs()
      .then((entries) => {
        if (!isMounted) {
          return;
        }

        setProductionEntries(entries.filter((entry) => entry.productCategory && entry.productName));
        setProductLoadError("");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setProductionEntries([]);
        setProductLoadError(
          error instanceof Error ? error.message : "Unable to fetch production material logs.",
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const productCategories = useMemo(
    () => Array.from(new Set(productionEntries.map((entry) => entry.productCategory))).filter(Boolean),
    [productionEntries],
  );

  const productNames = useMemo(
    () =>
      Array.from(
        new Set(
          productionEntries
            .filter((entry) => entry.productCategory === formData.productCategory)
            .map((entry) => entry.productName),
        ),
      ).filter(Boolean),
    [formData.productCategory, productionEntries],
  );

  const productColors = useMemo(
    () =>
      Array.from(
        new Set(
          productionEntries
            .filter(
              (entry) =>
                entry.productCategory === formData.productCategory &&
                entry.productName === formData.productName,
            )
            .map((entry) => entry.productColor),
        ),
      ).filter(Boolean),
    [formData.productCategory, formData.productName, productionEntries],
  );
  const isTileCleanerSelected = formData.productCategory === "Tile Cleaner";

  const tokenOptions = useMemo(
    () =>
      Array.from(
        new Set(
          productionEntries
            .filter(
              (entry) =>
                entry.productCategory === formData.productCategory &&
                entry.productName === formData.productName,
            )
            .map((entry) => entry.token),
        ),
      ).filter(Boolean),
    [formData.productCategory, formData.productName, productionEntries],
  );

  const bagSizes = useMemo(
    () =>
      Array.from(
        new Set(
          productionEntries
            .filter(
              (entry) =>
                entry.productCategory === formData.productCategory &&
                entry.productName === formData.productName &&
                (isTileCleanerSelected || entry.productColor === formData.productColor) &&
                (!formData.token || entry.token === formData.token),
            )
            .map((entry) => entry.bagSize),
        ),
      ).filter(Boolean),
    [
      formData.productCategory,
      formData.productName,
      formData.productColor,
      formData.token,
      isTileCleanerSelected,
      productionEntries,
    ],
  );

  const selectedProductionEntry = useMemo(
    () =>
      productionEntries.find(
        (entry) =>
          entry.productCategory === formData.productCategory &&
          entry.productName === formData.productName &&
          (isTileCleanerSelected || entry.productColor === formData.productColor) &&
          entry.bagSize === formData.bagSize,
      ),
    [
      formData.bagSize,
      formData.productCategory,
      formData.productColor,
      formData.productName,
      isTileCleanerSelected,
      productionEntries,
    ],
  );
  const totalRecentDeparturePages = Math.max(1, Math.ceil(recentDepartures.length / RECENT_DEPARTURES_PAGE_SIZE));
  const visibleRecentDepartures = recentDepartures.slice(
    (recentDeparturesPage - 1) * RECENT_DEPARTURES_PAGE_SIZE,
    recentDeparturesPage * RECENT_DEPARTURES_PAGE_SIZE,
  );
  const isManualProductSelection =
    otherSelections.productCategory ||
    otherSelections.productName ||
    otherSelections.productColor ||
    otherSelections.bagSize;

  useEffect(() => {
    if (!selectedProductionEntry) {
      if (!isManualProductSelection) {
        setFormData((current) => (current.quantity ? { ...current, quantity: "" } : current));
      }
      return;
    }

    if (isManualProductSelection) {
      return;
    }

    setFormData((current) => ({
      ...current,
      quantity: String(selectedProductionEntry.currentQuantity),
    }));
  }, [isManualProductSelection, selectedProductionEntry]);

  useEffect(() => {
    let isMounted = true;

    void fetchDispatchEntries()
      .then((entries) => {
        if (!isMounted) {
          return;
        }

        const sortedEntries = [...entries].sort((left, right) =>
          `${right.date} ${right.time}`.localeCompare(`${left.date} ${left.time}`),
        );
        setRecentDepartures(sortedEntries);
      })
      .catch(() => {
        if (isMounted) {
          setRecentDepartures([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (recentDeparturesPage > totalRecentDeparturePages) {
      setRecentDeparturesPage(totalRecentDeparturePages);
    }
  }, [recentDeparturesPage, totalRecentDeparturePages]);

  useEffect(() => {
    if (tokenOptions.length === 0) {
      setFormData((current) => (current.token ? { ...current, token: "" } : current));
      return;
    }

    setFormData((current) => {
      if (tokenOptions.includes(current.token)) {
        return current;
      }

      return {
        ...current,
        token: tokenOptions.length === 1 ? tokenOptions[0] : "",
      };
    });
  }, [tokenOptions]);

  useEffect(() => {
    if (!isTileCleanerSelected) {
      return;
    }

    setOtherSelections((current) =>
      current.productColor ? { ...current, productColor: false } : current,
    );

    setFormData((current) =>
      current.productColor ? { ...current, productColor: "" } : current,
    );
  }, [isTileCleanerSelected]);

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

  const getSelectValue = (field: DispatchOtherField, value: string) =>
    otherSelections[field] ? OTHER_OPTION : value;

  const handleSelectChange = (
    field: DispatchOtherField,
    value: string,
    fieldsToClear: DispatchOtherField[] = [],
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

  const renderOtherInput = (field: DispatchOtherField, label: string, placeholder: string) =>
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

  const validateForm = () => {
    if (!formData.date) {
      return "Date is required.";
    }

    if (!formData.time) {
      return "Time is required.";
    }

    if (!formData.challanNo.trim()) {
      return "Challan No. is required.";
    }

    if (!formData.challanName.trim()) {
      return "Challan name is required.";
    }

    if (!formData.vehicleNo.trim()) {
      return "Vehicle No. is required.";
    }

    if (!formData.driverName.trim()) {
      return "Driver name is required.";
    }

    if (!formData.driverContact.trim()) {
      return "Driver contact is required.";
    }

    if (!isDigitsOnly(formData.driverContact)) {
      return "Driver contact must contain only digits.";
    }

    if (!formData.dispatchTime) {
      return "Dispatch time is required.";
    }

    if (!formData.dispatchSite.trim()) {
      return "Dispatch site is required.";
    }

    if (!isPositiveNumber(formData.todayVehicleNo)) {
      return "Today vehicle No. must be greater than 0.";
    }

    if (!formData.productCategory) {
      return "Product category is required.";
    }

    if (!formData.productName) {
      return "Product name is required.";
    }

    if (!formData.token) {
      return "Token is required.";
    }

    if (!isTileCleanerSelected && !formData.productColor) {
      return "Product color is required.";
    }

    if (!formData.bagSize) {
      return "Bag size is required.";
    }

    if (!isPositiveNumber(formData.quantity)) {
      return "Available stock must be greater than 0.";
    }

    if (!isPositiveNumber(formData.totalBags)) {
      return "Departed bags must be greater than 0.";
    }

    if (Number(formData.totalBags) > Number(formData.quantity)) {
      return "Departed bags cannot be greater than available stock.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("idle");
    setSubmitMessage("");

    const validationMessage = validateForm();

    if (validationMessage) {
      setSubmitStatus("error");
      setSubmitMessage(validationMessage);
      toast.error(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      await submitSheetEntry("dispatch", {
        ...formData,
        productColor: isTileCleanerSelected ? "" : formData.productColor,
      });
      setFormData(initialFormData);
      setOtherSelections(initialDispatchOtherState);
      toast.success("Dispatch entry saved successfully.");
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "Unable to save dispatch entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="min-w-0">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>Product dispatch form</CardTitle>
            <CardDescription>Capture challan, vehicle, dispatch, product, quantity, and bag details.</CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link to="/dispatch-entries">
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
              setOtherSelections(initialDispatchOtherState);
              setSubmitStatus("idle");
              setSubmitMessage("");
            }}
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor="date" label="Date">
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField("date", e.target.value)}
                />
              </Field>
              <Field htmlFor="time" label="Time">
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => updateField("time", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor="challan-no" label="Challan No.">
                <Input
                  id="challan-no"
                  name="challanNo"
                  placeholder="e.g. CH-2405-112"
                  value={formData.challanNo}
                  onChange={(e) => updateField("challanNo", e.target.value)}
                />
              </Field>
              <Field htmlFor="challan-name" label="Challan Name">
                <Input
                  id="challan-name"
                  name="challanName"
                  placeholder="Enter challan name"
                  value={formData.challanName}
                  onChange={(e) => updateTextField("challanName", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor="vehicle-no" label="Vehicle No.">
                <Input
                  id="vehicle-no"
                  name="vehicleNo"
                  placeholder="Enter vehicle number"
                  value={formData.vehicleNo}
                  onChange={(e) => updateField("vehicleNo", e.target.value)}
                />
              </Field>
              <Field htmlFor="driver-name" label="Driver Name">
                <Input
                  id="driver-name"
                  name="driverName"
                  placeholder="Enter driver name"
                  value={formData.driverName}
                  onChange={(e) => updateTextField("driverName", e.target.value)}
                />
              </Field>
              <Field htmlFor="driver-contact" label="Driver Contact">
                <Input
                  id="driver-contact"
                  name="driverContact"
                  placeholder="Enter driver contact number"
                  value={formData.driverContact}
                  onChange={(e) => updateNumberField("driverContact", e.target.value)}
                />
              </Field>
              <Field htmlFor="dispatch-time" label="Dispatch Time">
                <Input
                  id="dispatch-time"
                  name="dispatchTime"
                  type="time"
                  value={formData.dispatchTime}
                  onChange={(e) => updateField("dispatchTime", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor="dispatch-site" label="Dispatch Site">
                <Input
                  id="dispatch-site"
                  name="dispatchSite"
                  placeholder="Enter dispatch site"
                  value={formData.dispatchSite}
                  onChange={(e) => updateTextField("dispatchSite", e.target.value)}
                />
              </Field>
              <Field htmlFor="today-vehicle-no" label="Today Vehicle No.">
                <Input
                  id="today-vehicle-no"
                  min="1"
                  name="todayVehicleNo"
                  placeholder="Daily vehicle count"
                  type="number"
                  value={formData.todayVehicleNo}
                  onChange={(e) => updateNumberField("todayVehicleNo", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <Field htmlFor="product-category" label="Product Category">
                <Select
                  id="product-category"
                  name="productCategory"
                  value={getSelectValue("productCategory", formData.productCategory)}
                  onChange={(e) =>
                    handleSelectChange(
                      "productCategory",
                      e.target.value,
                      ["token", "productName", "productColor", "bagSize"],
                      { quantity: "" },
                    )
                  }
                  disabled={isLoadingProducts}
                >
                  <option value="" disabled>
                    {isLoadingProducts ? "Loading categories..." : "Select category"}
                  </option>
                  {getOptionsWithOther(productCategories).map((option) => (
                    <option key={option} value={option === "Other" ? OTHER_OPTION : option}>{option}</option>
                  ))}
                </Select>
              </Field>
              {renderOtherInput("productCategory", "Product Category", "Enter product category")}

              <Field htmlFor="product-name" label="Product Name">
                <Select
                  id="product-name"
                  name="productName"
                  value={getSelectValue("productName", formData.productName)}
                  onChange={(e) =>
                    handleSelectChange(
                      "productName",
                      e.target.value,
                      ["token", "productColor", "bagSize"],
                      { quantity: "" },
                    )
                  }
                  disabled={!formData.productCategory}
                >
                  <option value="" disabled>
                    Select product
                  </option>
                  {getOptionsWithOther(productNames).map((option) => (
                    <option key={option} value={option === "Other" ? OTHER_OPTION : option}>{option}</option>
                  ))}
                </Select>
              </Field>
              {renderOtherInput("productName", "Product Name", "Enter product name")}

              <Field htmlFor="token" label="Token">
                <Select
                  id="token"
                  name="token"
                  value={getSelectValue("token", formData.token)}
                  onChange={(e) => handleSelectChange("token", e.target.value)}
                  disabled={!formData.productName}
                >
                  <option value="" disabled>
                    {!formData.productName ? "Select product first" : "Select token type"}
                  </option>
                  {getOptionsWithOther(tokenOptions).map((option) => (
                    <option key={option} value={option === "Other" ? OTHER_OPTION : option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
              {renderOtherInput("token", "Token", "Enter token")}


              <Field htmlFor="product-color" label="Product Color">
                <Select
                  id="product-color"
                  name="productColor"
                  value={isTileCleanerSelected ? "" : getSelectValue("productColor", formData.productColor)}
                  onChange={(e) =>
                    handleSelectChange("productColor", e.target.value, ["bagSize"], { quantity: "" })
                  }
                  disabled={!formData.productName || isTileCleanerSelected}
                >
                  <option value="" disabled>
                    {isTileCleanerSelected ? "Not applicable for Tile Cleaner" : "Select color"}
                  </option>
                  {getOptionsWithOther(productColors).map((option) => (
                    <option key={option} value={option === "Other" ? OTHER_OPTION : option}>{option}</option>
                  ))}
                </Select>
              </Field>
              {!isTileCleanerSelected &&
                renderOtherInput("productColor", "Product Color", "Enter product color")}

              <Field htmlFor="bag-size" label="Bag Size">
                <Select
                  id="bag-size"
                  name="bagSize"
                  value={getSelectValue("bagSize", formData.bagSize)}
                  onChange={(e) => handleSelectChange("bagSize", e.target.value)}
                  disabled={!formData.productName || (!isTileCleanerSelected && !formData.productColor)}
                >
                  <option value="" disabled>
                    Select bag size
                  </option>
                  {getOptionsWithOther(bagSizes).map((option) => (
                    <option key={option} value={option === "Other" ? OTHER_OPTION : option}>{option}</option>
                  ))}
                </Select>
              </Field>
              {renderOtherInput("bagSize", "Bag Size", "Enter bag size")}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor="quantity" label="Available Stock">
                <Input
                  id="quantity"
                  min="0"
                  name="quantity"
                  placeholder="0"
                  step="0.01"
                  type="number"
                  readOnly={!isManualProductSelection}
                  value={formData.quantity}
                  onChange={(e) => updateNumberField("quantity", e.target.value, { allowDecimal: true })}
                />
              </Field>
              <Field htmlFor="total-bags" label="Departed Bags">
                <Input
                  id="total-bags"
                  min="0"
                  name="totalBags"
                  placeholder="0"
                  type="number"
                  value={formData.totalBags}
                  onChange={(e) => updateNumberField("totalBags", e.target.value, { allowDecimal: true })}
                />
              </Field>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
              {submitStatus === "error" && submitMessage && (
                <p
                  className="text-sm font-medium text-destructive sm:mr-auto"
                >
                  {submitMessage}
                </p>
              )}
              {productLoadError && (
                <p className="text-sm font-medium text-destructive sm:mr-auto">
                  {productLoadError}
                </p>
              )}
              <Button disabled={isSubmitting} type="reset" variant="outline">
                <RotateCcw />
                Reset
              </Button>
              <Button disabled={isSubmitting} type="submit">
                <Save />
                {isSubmitting ? "Saving..." : "Save departure"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Recent departures</CardTitle>
            <CardDescription>Latest dispatch entries for this register.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleRecentDepartures.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                No dispatch entries available yet.
              </div>
            ) : (
              visibleRecentDepartures.map((departure) => (
              <div className="rounded-md border p-3" key={departure.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{departure.productName || "Dispatch entry"}</p>
                  <span className="text-xs text-muted-foreground">{departure.challanNo || departure.id}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[departure.totalBags, "bags"].filter(Boolean).join(" ")} dispatched by {departure.vehicleNo || "-"}
                </p>
              </div>
            )))}
            {recentDepartures.length > RECENT_DEPARTURES_PAGE_SIZE ? (
              <div className="flex items-center justify-between gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecentDeparturesPage((page) => Math.max(1, page - 1))}
                  disabled={recentDeparturesPage === 1}
                >
                  Prev
                </Button>
                <span className="text-xs text-muted-foreground">
                  {recentDeparturesPage} / {totalRecentDeparturePages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecentDeparturesPage((page) => Math.min(totalRecentDeparturePages, page + 1))}
                  disabled={recentDeparturesPage === totalRecentDeparturePages}
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
