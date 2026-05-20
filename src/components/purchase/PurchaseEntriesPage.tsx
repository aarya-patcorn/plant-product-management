import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Pencil, Save, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fetchPurchaseEntries, type PurchaseEntry } from "@/lib/googleSheetApi";

const rawMaterialOptions = ["Cement", "Sand", "Chemical", "Packaging", "Spares", "Other"];
const unitOptions = ["kg", "ltr", "mt", "pcs", "bags", "others"];
const ENTRIES_PER_PAGE = 10;

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

function buildMaterialLabel(entry: PurchaseEntry) {
  return [entry.rawMaterialName, entry.packagingType, entry.level2, entry.level3]
    .filter(Boolean)
    .join(" / ");
}

export function PurchaseEntriesPage() {
  const [entries, setEntries] = useState<PurchaseEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<PurchaseEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    void fetchPurchaseEntries()
      .then((purchaseEntries) => {
        if (!isMounted) {
          return;
        }

        setEntries(purchaseEntries);
        setLoadError("");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setEntries([]);
        setLoadError(error instanceof Error ? error.message : "Unable to fetch purchase entries.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedEntries = useMemo(
    () =>
      [...entries].sort((left, right) =>
        `${right.date} ${right.time}`.localeCompare(`${left.date} ${left.time}`),
      ),
    [entries],
  );

  const totalPages = Math.max(1, Math.ceil(sortedEntries.length / ENTRIES_PER_PAGE));
  const paginatedEntries = useMemo(
    () => sortedEntries.slice((currentPage - 1) * ENTRIES_PER_PAGE, currentPage * ENTRIES_PER_PAGE),
    [currentPage, sortedEntries],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = (entryId: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== entryId));
    setEditingEntry((current) => (current?.id === entryId ? null : current));
    toast("Delete action is not available in the sheet API yet.", {
      icon: "!",
    });
  };

  const handleUpdate = () => {
    if (!editingEntry) {
      return;
    }

    setEntries((current) =>
      current.map((entry) => (entry.id === editingEntry.id ? editingEntry : entry)),
    );
    setEditingEntry(null);
    toast("Update action is not available in the sheet API yet.", {
      icon: "!",
    });
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>All purchase entries</CardTitle>
            <CardDescription>Review, update, and delete saved purchase records.</CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link to="/purchase-entry">
              <ArrowLeft />
              Back to purchase form
            </Link>
          </Button>
        </CardHeader>
      </Card>

      {editingEntry && (
        <Card>
          <CardHeader>
            <CardTitle>Edit purchase entry</CardTitle>
            <CardDescription>Update the selected record and save your changes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field htmlFor="edit-id" label="ID">
                <Input
                  disabled
                  id="edit-id"
                  value={editingEntry.id}
                />
              </Field>
              <Field htmlFor="edit-date" label="Date">
                <Input
                  id="edit-date"
                  type="date"
                  value={editingEntry.date}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, date: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-time" label="Time">
                <Input
                  id="edit-time"
                  type="time"
                  value={editingEntry.time}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, time: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-unit" label="Unit">
                <Select
                  id="edit-unit"
                  value={editingEntry.unit}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, unit: event.target.value } : current)
                  }
                >
                  <option value="">Select unit</option>
                  {unitOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field htmlFor="edit-rawMaterialName" label="Raw Material Name">
                <Select
                  id="edit-rawMaterialName"
                  value={editingEntry.rawMaterialName}
                  onChange={(event) =>
                    setEditingEntry((current) =>
                      current ? { ...current, rawMaterialName: event.target.value } : current,
                    )
                  }
                >
                  <option value="">Select raw material</option>
                  {rawMaterialOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field htmlFor="edit-packagingType" label="Packaging Type">
                <Input
                  id="edit-packagingType"
                  value={editingEntry.packagingType}
                  onChange={(event) =>
                    setEditingEntry((current) =>
                      current ? { ...current, packagingType: event.target.value } : current,
                    )
                  }
                />
              </Field>
              <Field htmlFor="edit-level2" label="Level 2">
                <Input
                  id="edit-level2"
                  value={editingEntry.level2}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, level2: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-level3" label="Level 3">
                <Input
                  id="edit-level3"
                  value={editingEntry.level3}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, level3: event.target.value } : current)
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field htmlFor="edit-quantityPurchased" label="Quantity Purchased">
                <Input
                  id="edit-quantityPurchased"
                  type="number"
                  value={editingEntry.quantityPurchased}
                  onChange={(event) =>
                    setEditingEntry((current) =>
                      current ? { ...current, quantityPurchased: event.target.value } : current,
                    )
                  }
                />
              </Field>
              <Field htmlFor="edit-supplierName" label="Supplier Name">
                <Input
                  id="edit-supplierName"
                  value={editingEntry.supplierName}
                  onChange={(event) =>
                    setEditingEntry((current) =>
                      current ? { ...current, supplierName: event.target.value } : current,
                    )
                  }
                />
              </Field>
              <Field htmlFor="edit-invoiceNo" label="Invoice No">
                <Input
                  id="edit-invoiceNo"
                  value={editingEntry.invoiceNo}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, invoiceNo: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-unloadBy" label="Unload By">
                <Input
                  id="edit-unloadBy"
                  value={editingEntry.unloadBy}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, unloadBy: event.target.value } : current)
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor="edit-attachFile" label="Attach File">
                <Input
                  id="edit-attachFile"
                  value={editingEntry.attachFile}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, attachFile: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-remarks" label="Remarks">
                <Textarea
                  id="edit-remarks"
                  value={editingEntry.remarks}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, remarks: event.target.value } : current)
                  }
                />
              </Field>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
              <Button onClick={() => setEditingEntry(null)} type="button" variant="outline">
                Cancel
              </Button>
              <Button onClick={handleUpdate} type="button">
                <Save />
                Update entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Saved entries</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading purchase entries from sheet..."
              : sortedEntries.length === 0
              ? "No purchase entries have been saved yet."
              : `${sortedEntries.length} purchase entries available.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadError ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-destructive">
              {loadError}
            </div>
          ) : isLoading ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Fetching entries from sheet...
            </div>
          ) : sortedEntries.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Add a purchase entry first, then manage it here.
            </div>
          ) : (
            <>
              <div className="space-y-4 lg:hidden">
                {paginatedEntries.map((entry) => (
                  <Card key={entry.id} className="rounded-md border shadow-none">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{buildMaterialLabel(entry) || "Purchase entry"}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{entry.invoiceNo || entry.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            type="button"
                            variant="outline"
                            onClick={() => setEditingEntry(entry)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon"
                            type="button"
                            variant="destructive"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Date</p>
                          <p className="mt-1">{entry.date || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Time</p>
                          <p className="mt-1">{entry.time || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Quantity</p>
                          <p className="mt-1">
                            {[entry.quantityPurchased, entry.unit].filter(Boolean).join(" ") || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Supplier</p>
                          <p className="mt-1">{entry.supplierName || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Unload By</p>
                          <p className="mt-1">{entry.unloadBy || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Attachment</p>
                          <p className="mt-1 break-all">{entry.attachFile || "-"}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Remarks</p>
                          <p className="mt-1 text-muted-foreground">{entry.remarks || "-"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Unload By</TableHead>
                      <TableHead>Attachment</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="max-w-[140px] truncate whitespace-nowrap text-xs text-muted-foreground" title={entry.id}>
                          {entry.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap" title={entry.date || "-"}>
                          {entry.date || "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap" title={entry.time || "-"}>
                          {entry.time || "-"}
                        </TableCell>
                        <TableCell className="min-w-[220px] max-w-[220px] truncate whitespace-nowrap" title={buildMaterialLabel(entry) || "-"}>
                          {buildMaterialLabel(entry) || "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap" title={[entry.quantityPurchased, entry.unit].filter(Boolean).join(" ") || "-"}>
                          {[entry.quantityPurchased, entry.unit].filter(Boolean).join(" ") || "-"}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate whitespace-nowrap" title={entry.supplierName || "-"}>
                          {entry.supplierName || "-"}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate whitespace-nowrap" title={entry.invoiceNo || "-"}>
                          {entry.invoiceNo || "-"}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate whitespace-nowrap" title={entry.unloadBy || "-"}>
                          {entry.unloadBy || "-"}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate whitespace-nowrap" title={entry.attachFile || "-"}>
                          {entry.attachFile || "-"}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate whitespace-nowrap" title={entry.remarks || "-"}>
                          {entry.remarks || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              type="button"
                              variant="outline"
                              onClick={() => setEditingEntry(entry)}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              size="icon"
                              type="button"
                              variant="destructive"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {!isLoading && !loadError && sortedEntries.length > 0 ? (
            <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ENTRIES_PER_PAGE + 1}-{Math.min(currentPage * ENTRIES_PER_PAGE, sortedEntries.length)} of {sortedEntries.length}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
