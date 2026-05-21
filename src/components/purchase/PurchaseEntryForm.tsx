import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Eye, ReceiptText, RotateCcw, Save, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetchPurchaseEntries, submitSheetEntry, type PurchaseEntry } from "@/lib/googleSheetApi";

const unitOptions = ["kg", "ltr", "mt", "pcs", "bags", "others"];
const materialOptions = ["Cement", "Sand", "Chemical", "Packaging", "Spares", "Other"];
const epoxySandColorOptions = [
  "White",
  "Black",
  "Ivory",
  "Blue",
  "Slate Grey",
  "Light Grey",
  "Dark Grey",
  "Coffee brown",
  "Jaisalmer colour",
  "Sabal",
  "Savetrane",
  "Terracotta",
];
const RECENT_PURCHASES_PAGE_SIZE = 3;

const initialFormData = {
  date: "",
  time: "",
  rawMaterialName: "",
  packagingType: "",
  level2: "",
  level3: "",
  colorOfSandEpoxy: "",
  quantityPurchased: "",
  unit: "",
  supplierName: "",
  invoiceNo: "",
  unloadBy: "",
  attachFile: "",
  remarks: "",
};

type MaterialConfig = {
  label: string;
  options: string[];
  children?: Record<string, MaterialConfig>;
};

type RawMaterialName = "Cement" | "Sand" | "Chemical" | "Packaging" | "Spares";
type RawMaterialOption = RawMaterialName | "Other" | "";
const rawMaterialConfig: Record<RawMaterialName, MaterialConfig> = {
  Cement: {
    label: "Cement Type",
    options: ["PPC", "OPC", "White Cement"],
    children: {
      PPC: {
        label: "Packaging Type",
        options: ["Bulker", "Bags"],
      },
    },
  },

  Sand: {
    label: "Sand Type",
    options: ["Grey", "White"],
    children: {
      Grey: {
        label: "Sand Size",
        options: ["Small (600 micron)", "Big (1200 micron)"],
      },
    },
  },

  Chemical: {
    label: "Select Chemical",
    options: [
      "Calcium Carbonate",
      "Black Pigment",
      "Red pigment",
      "K50 Chemical",
      "Blue pigment",
      "Yellow pigment",
      "Premix",
      "Byk",
      "Benton",
      "Urea (Technical Grade)",
      "Sulphamic Acid",
      "Hydrochloric Acid (32%)",
      "Citric Acid",
      "2-Butoxyethanol",
      "Cocamidopropyl Betaine",
      "Alphox-200",
      "Xanthan Gum",
      "Fragrance & Dye"
    ],
  },

  Packaging: {
    label: "Packaging Type",
    options: ["Bulk", "FG"],

    children: {
      FG: {
        label: "FG Product",
        options: [
          "Adhesive",
          "Tile Grout",
          "Epoxy",
          "Tile Cleaner",
          "Block Joint",
        ],

        children: {
          Adhesive: {
            label: "Packaging Size",
            options: ["20KG Bag", "50KG Bag", "Token"],
          },

          "Tile Grout": {
            label: "Packaging",
            options: ["Pouch 1KG", "Carton 1x25"],
          },

          Epoxy: {
            label: "Packaging Material",
            options: [
              "Bucket 1KG",
              "Bucket 5KG",
              "Sticker",
              "Sponge",
              "Resin",
              "Hardner",
              "Pigments",
              "Coloured Sand",
              "Carton 1x4",
              "Carton 1x8",
            ],
          },

          "Tile Cleaner": {
            label: "Packaging Material",
            options: ["Bucket", "Cap", "Sticker", "Seal"],
          },

          "Block Joint": {
            label: "Packaging",
            options: ["40KG Bag"],
          },
        },
      },
    },
  },

  Spares: {
    label: "Machine Type",
    options: ["Printing", "Sealing", "Stretching"],
  },
};

const hasRawMaterialConfig = (value: RawMaterialOption): value is RawMaterialName =>
  value !== "" && value !== "Other" && value in rawMaterialConfig;


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

function readFilePayload(file: File) {
  return new Promise<Record<string, string>>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const [, base64 = ""] = result.split(",");

      resolve({
        attachFileName: file.name,
        attachFileType: file.type || "application/octet-stream",

        attachFileBase64: base64,
      });
    };

    reader.onerror = () => reject(new Error("Unable to read attached file."));
    reader.readAsDataURL(file);
  });
}

function isPositiveNumber(value: string) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0;
}

export function PurchaseEntryForm() {

  const [formData, setFormData] = useState(initialFormData)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recentPurchases, setRecentPurchases] = useState<PurchaseEntry[]>([]);
  const [recentPurchasesPage, setRecentPurchasesPage] = useState(1);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    void fetchPurchaseEntries()
      .then((entries) => {
        if (isMounted) {
          setRecentPurchases(entries.slice(0, 5));
        }
      })
      .catch(() => {
        if (isMounted) {
          setRecentPurchases([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalRecentPurchasePages = Math.max(1, Math.ceil(recentPurchases.length / RECENT_PURCHASES_PAGE_SIZE));
  const visibleRecentPurchases = recentPurchases.slice(
    (recentPurchasesPage - 1) * RECENT_PURCHASES_PAGE_SIZE,
    recentPurchasesPage * RECENT_PURCHASES_PAGE_SIZE,
  );

  useEffect(() => {
    if (recentPurchasesPage > totalRecentPurchasePages) {
      setRecentPurchasesPage(totalRecentPurchasePages);
    }
  }, [recentPurchasesPage, totalRecentPurchasePages]);

  const config = useMemo(() => {
    return hasRawMaterialConfig(formData.rawMaterialName as RawMaterialOption)
      ? rawMaterialConfig[formData.rawMaterialName as RawMaterialName]
      : undefined;
  }, [formData.rawMaterialName])

  const level2Config = useMemo(() => {
    return config && "children" in config
      ? config.children?.[formData.packagingType as keyof typeof config.children]
      : undefined;
  }, [config, formData.packagingType])

  const level3Config = useMemo(() => {
    return level2Config && "children" in level2Config
      ? level2Config.children?.[formData.level2 as keyof typeof level2Config.children]
      : undefined;
  }, [level2Config, formData.level2])

  const shouldShowEpoxySandColorField =
    formData.rawMaterialName === "Packaging" &&
    formData.packagingType === "FG" &&
    formData.level2 === "Epoxy" &&
    formData.level3 === "Coloured Sand";

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

    if (!formData.rawMaterialName) {
      return "Raw material name is required.";
    }

    if (config && !formData.packagingType) {
      return `${config.label} is required.`;
    }

    if (level2Config && !formData.level2) {
      return `${level2Config.label} is required.`;
    }

    if (level3Config && !formData.level3) {
      return `${level3Config.label} is required.`;
    }

    if (shouldShowEpoxySandColorField && !formData.colorOfSandEpoxy) {
      return "Color of sand (epoxy) is required.";
    }

    if (!isPositiveNumber(formData.quantityPurchased)) {
      return "Quantity purchased must be greater than 0.";
    }

    if (!formData.unit) {
      return "Unit is required.";
    }

    if (!formData.supplierName.trim()) {
      return "Supplier name is required.";
    }

    if (!formData.invoiceNo.trim()) {
      return "Bill / Invoice No. is required.";
    }

    if (!formData.unloadBy.trim()) {
      return "Unload By is required.";
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
      const filePayload = selectedFile ? await readFilePayload(selectedFile) : {};
      const submittedEntry: PurchaseEntry = {
        id: crypto.randomUUID(),
        serialNo: "",
        ...formData,
        purchaseStock: formData.quantityPurchased,
        currentStock: "",
        usedInProduction: "",
        attachFile: selectedFile?.name ?? "",
      };

      await submitSheetEntry("purchase", {
        ...submittedEntry,
        ...filePayload,
      });
      const latestEntries = await fetchPurchaseEntries();
      setRecentPurchases(latestEntries);
      setRecentPurchasesPage(1);
      setFormData(initialFormData);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
      toast.success("Purchase entry saved successfully.");
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "Unable to save purchase entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="min-w-0">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>Purchase entry form</CardTitle>
            <CardDescription>Capture each purchase using the same columns as your Google Sheet.</CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link to="/purchase-entries">
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
              setSelectedFile(null);
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
              <Field htmlFor="raw-material-name" label="Raw Material Name">
                <Select
                  id="raw-material-name"
                  name="rawMaterialName"
                  value={formData.rawMaterialName}
                  onChange={(e) => {
                    setFormData((current) => ({
                      ...current,
                      rawMaterialName: e.target.value,
                      packagingType: "",
                      level2: "",
                      level3: "",
                      colorOfSandEpoxy: "",
                      unloadBy: "",
                    }))
                  }}
                >
                  <option value="" disabled>
                    Select Raw Material
                  </option>

                  {materialOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>

              {/* LEVEL 1 */}
              {config && (
                <Field htmlFor="level1" label={config.label}>
                  <Select
                    id="level1"
                    name="packagingType"
                    value={formData.packagingType}
                    onChange={(e) => {
                      setFormData((current) => ({
                        ...current,
                        packagingType: e.target.value,
                        level2: "",
                        level3: "",
                        colorOfSandEpoxy: "",
                        unloadBy: "",
                      }))
                    }}
                  >
                    <option value="" disabled>
                      Select {config.label}
                    </option>

                    {config.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              {/* LEVEL 2 */}
              {level2Config && (
                <Field htmlFor="level2" label={level2Config.label}>
                  <Select
                    id="level2"
                    name="level2"
                    value={formData.level2}
                    onChange={(e) => {
                      setFormData((current) => ({
                        ...current,
                        level2: e.target.value,
                        level3: "",
                        colorOfSandEpoxy: "",
                      }))
                    }}
                  >
                    <option value="" disabled>
                      Select {level2Config.label}
                    </option>

                    {level2Config.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              {/* LEVEL 3 */}
              {level3Config && (
                <Field htmlFor="level3" label={level3Config.label}>
                  <Select
                    id="level3"
                    name="level3"
                    value={formData.level3}
                    onChange={(e) =>
                      setFormData((current) => ({
                        ...current,
                        level3: e.target.value,
                        colorOfSandEpoxy: "",
                      }))
                    }
                  >
                    <option value="" disabled>
                      Select {level3Config.label}
                    </option>

                    {level3Config.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              {shouldShowEpoxySandColorField && (
                <Field htmlFor="color-of-sand-epoxy" label="Color Of Sand (Epoxy)">
                  <Select
                    id="color-of-sand-epoxy"
                    name="colorOfSandEpoxy"
                    value={formData.colorOfSandEpoxy}
                    onChange={(e) => updateField("colorOfSandEpoxy", e.target.value)}
                  >
                    <option value="" disabled>
                      Select sand color
                    </option>
                    {epoxySandColorOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field htmlFor="quantity-purchased" label="Quantity Purchased">
                <Input
                  id="quantity-purchased"
                  min="0"
                  name="quantityPurchased"
                  placeholder="Enter quantity"
                  type="number"
                  value={formData.quantityPurchased}
                  onChange={(e) => updateField("quantityPurchased", e.target.value)}
                />
              </Field>

              <Field htmlFor="unit" label="Unit">
                <Select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={(e) => updateField("unit", e.target.value)}
                >
                  <option value="" disabled>
                    Unit
                  </option>
                  {unitOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="supplier-name" label="Supplier Name">
                <Input
                  id="supplier-name"
                  name="supplierName"
                  placeholder="Enter supplier name"
                  value={formData.supplierName}
                  onChange={(e) => updateField("supplierName", e.target.value)}
                />
              </Field>

            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field htmlFor="invoice-no" label="Bill / Invoice No.">
                <Input
                  id="invoice-no"
                  name="invoiceNo"
                  placeholder="Invoice number"
                  value={formData.invoiceNo}
                  onChange={(e) => updateField("invoiceNo", e.target.value)}
                />
              </Field>
              <Field htmlFor="unload-by" label="Unload By">

                {/* Cement + Bulker */}
                {formData.rawMaterialName === "Cement" &&
                  formData.packagingType === "Bulker" ? (

                  <select
                    id="unload-by"
                    name="unloadBy"
                    className="w-full h-10 border rounded-md px-3"
                    value={formData.unloadBy}
                    onChange={(e) => updateField("unloadBy", e.target.value)}
                  >
                    <option value="">Select Person</option>
                    <option value="Vasu">Vasu</option>
                    <option value="Sujit">Sujit</option>
                    <option value="Thalesh">Thalesh</option>
                  </select>

                ) : formData.rawMaterialName === "Cement" &&
                  formData.packagingType === "Bags" ? (

                  /* Cement + Bag */

                  <select
                    id="unload-by"
                    name="unloadBy"
                    className="w-full h-10 border rounded-md px-3"
                    value={formData.unloadBy}
                    onChange={(e) => updateField("unloadBy", e.target.value)}
                  >
                    <option value="">Select Person</option>
                    <option value="Anand">Anand</option>
                    <option value="Chandrashekhar">Chandrashekhar</option>
                    <option value="Sushil">Sushil</option>
                  </select>

                ) : formData.rawMaterialName === "Sand" ? (

                  /* Sand */

                  <select
                    id="unload-by"
                    name="unloadBy"
                    className="w-full h-10 border rounded-md px-3"
                    value={formData.unloadBy}
                    onChange={(e) => updateField("unloadBy", e.target.value)}
                  >
                    <option value="">Select Person</option>
                    <option value="Anand">Anand</option>
                    <option value="Chandrashekhar">Chandrashekhar</option>
                    <option value="Sushil">Sushil</option>
                  </select>

                ) : (

                  /* Default Input */

                  <Input
                    id="unload-by"
                    name="unloadBy"
                    placeholder="Person or team name"
                    value={formData.unloadBy}
                    onChange={(e) => updateField("unloadBy", e.target.value)}
                  />
                )}
              </Field>

              <Field htmlFor="attach-file" label="Attach File">
                <Input
                  ref={fileInputRef}
                  name="attachFile"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setSelectedFile(file);
                    setFormData((prev) => ({
                      ...prev,
                      attachFile: file?.name || "",
                    }));
                  }}
                />
              </Field>
            </div>

            <Field htmlFor="remarks" label="Remarks">
              <Textarea
                id="remarks"
                name="remarks"
                placeholder="Add notes about quality, shortage, damage, or payment status"
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
                {isSubmitting ? "Saving..." : "Save purchase"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Recent purchases</CardTitle>
            <CardDescription>Latest saved purchase entries.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPurchases.length === 0 ? (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                Saved purchase entries will appear here.
              </div>
            ) : (
              visibleRecentPurchases.map((purchase) => {
                const materialPath = [
                  purchase.rawMaterialName,
                  purchase.packagingType,
                  purchase.level2,
                  purchase.level3,
                ].filter(Boolean).join(" / ");
                const quantity = [purchase.quantityPurchased, purchase.unit].filter(Boolean).join(" ");

                return (
                  <div className="rounded-md border p-3" key={purchase.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{materialPath || "Purchase entry"}</p>
                      <span className="text-xs text-muted-foreground">
                        {purchase.invoiceNo || purchase.id}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>{quantity || "Quantity not provided"}</p>
                      <p>{purchase.supplierName || "Supplier not provided"}</p>
                      <p>
                        {[purchase.date, purchase.time].filter(Boolean).join(" at ") || "Date not provided"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            {recentPurchases.length > RECENT_PURCHASES_PAGE_SIZE ? (
              <div className="flex items-center justify-between gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecentPurchasesPage((page) => Math.max(1, page - 1))}
                  disabled={recentPurchasesPage === 1}
                >
                  Prev
                </Button>
                <span className="text-xs text-muted-foreground">
                  {recentPurchasesPage} / {totalRecentPurchasePages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecentPurchasesPage((page) => Math.min(totalRecentPurchasePages, page + 1))}
                  disabled={recentPurchasesPage === totalRecentPurchasePages}
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
