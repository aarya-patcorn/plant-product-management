import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ClipboardList, Eye, RotateCcw, Save, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  fetchDispatchEntries,
  fetchProductionMaterialLogs,
  submitSheetEntry,
  type DispatchEntry,
  type ProductionMaterialLog,
} from "@/lib/googleSheetApi";

const RECENT_DEPARTURES_PAGE_SIZE = 3;

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

function isPositiveNumber(value: string) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0;
}

function isDigitsOnly(value: string) {
  return /^\d+$/.test(value.trim());
}

export function ProductDepartureForm() {
  const [formData, setFormData] = useState(initialFormData);
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

  const tokenOptions = useMemo(
    () =>
      Array.from(
        new Set(
          productionEntries
            .filter(
              (entry) =>
                entry.productCategory === formData.productCategory &&
                entry.productName === formData.productName &&
                (!formData.productColor || entry.productColor === formData.productColor),
            )
            .map((entry) => entry.token),
        ),
      ).filter(Boolean),
    [formData.productCategory, formData.productColor, formData.productName, productionEntries],
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
                entry.productColor === formData.productColor,
            )
            .map((entry) => entry.bagSize),
        ),
      ).filter(Boolean),
    [formData.productCategory, formData.productName, formData.productColor, productionEntries],
  );

  const selectedProductionEntry = useMemo(
    () =>
      productionEntries.find(
        (entry) =>
          entry.productCategory === formData.productCategory &&
          entry.productName === formData.productName &&
          entry.productColor === formData.productColor &&
          entry.bagSize === formData.bagSize,
      ),
    [formData.bagSize, formData.productCategory, formData.productColor, formData.productName, productionEntries],
  );
  const totalRecentDeparturePages = Math.max(1, Math.ceil(recentDepartures.length / RECENT_DEPARTURES_PAGE_SIZE));
  const visibleRecentDepartures = recentDepartures.slice(
    (recentDeparturesPage - 1) * RECENT_DEPARTURES_PAGE_SIZE,
    recentDeparturesPage * RECENT_DEPARTURES_PAGE_SIZE,
  );

  useEffect(() => {
    if (!selectedProductionEntry) {
      setFormData((current) => (current.quantity ? { ...current, quantity: "" } : current));
      return;
    }

    setFormData((current) => ({
      ...current,
      quantity: String(selectedProductionEntry.currentQuantity),
    }));
  }, [selectedProductionEntry]);

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

  const updateField = (name: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

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

    if (!formData.productColor) {
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
      await submitSheetEntry("dispatch", formData);
      setFormData(initialFormData);
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
                  onChange={(e) => updateField("challanName", e.target.value)}
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
                  onChange={(e) => updateField("driverName", e.target.value)}
                />
              </Field>
              <Field htmlFor="driver-contact" label="Driver Contact">
                <Input
                  id="driver-contact"
                  name="driverContact"
                  placeholder="Enter driver contact number"
                  value={formData.driverContact}
                  onChange={(e) => updateField("driverContact", e.target.value)}
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
                  onChange={(e) => updateField("dispatchSite", e.target.value)}
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
                  onChange={(e) => updateField("todayVehicleNo", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">

              <Field htmlFor="product-category" label="Product Category">
                <Select
                  id="product-category"
                  name="productCategory"
                  value={formData.productCategory}
                  onChange={(e) =>
                    setFormData((current) => ({
                      ...current,
                      productCategory: e.target.value,
                      token: "",
                      productName: "",
                      productColor: "",
                      bagSize: "",
                      quantity: "",
                    }))
                  }
                  disabled={isLoadingProducts || productCategories.length === 0}
                >
                  <option value="" disabled>
                    {isLoadingProducts ? "Loading categories..." : "Select category"}
                  </option>
                  {productCategories.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="product-name" label="Product Name">
                <Select
                  id="product-name"
                  name="productName"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData((current) => ({
                      ...current,
                      productName: e.target.value,
                      token: "",
                      productColor: "",
                      bagSize: "",
                      quantity: "",
                    }))
                  }
                  disabled={!formData.productCategory || productNames.length === 0}
                >
                  <option value="" disabled>
                    Select product
                  </option>
                  {productNames.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="token" label="Token">
                <Select
                  id="token"
                  name="token"
                  value={formData.token}
                  onChange={(e) => updateField("token", e.target.value)}
                  disabled={!formData.productName || tokenOptions.length === 0}
                >
                  <option value="" disabled>
                    {!formData.productName ? "Select product first" : "Select token type"}
                  </option>
                  {tokenOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>


              <Field htmlFor="product-color" label="Product Color">
                <Select
                  id="product-color"
                  name="productColor"
                  value={formData.productColor}
                  onChange={(e) =>
                    setFormData((current) => ({
                      ...current,
                      productColor: e.target.value,
                      token: "",
                      bagSize: "",
                      quantity: "",
                    }))
                  }
                  disabled={!formData.productName || productColors.length === 0}
                >
                  <option value="" disabled>
                    Select color
                  </option>
                  {productColors.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="bag-size" label="Bag Size">
                <Select
                  id="bag-size"
                  name="bagSize"
                  value={formData.bagSize}
                  onChange={(e) =>
                    setFormData((current) => ({
                      ...current,
                      bagSize: e.target.value,
                    }))
                  }
                  disabled={!formData.productColor || bagSizes.length === 0}
                >
                  <option value="" disabled>
                    Select bag size
                  </option>
                  {bagSizes.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </Field>
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
                  readOnly
                  value={formData.quantity}
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
                  onChange={(e) => updateField("totalBags", e.target.value)}
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
