import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Pencil, Save, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fetchDispatchEntries, type DispatchEntry } from "@/lib/googleSheetApi";

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

function buildDispatchLabel(entry: DispatchEntry) {
  return [entry.productCategory, entry.productName, entry.productColor].filter(Boolean).join(" / ");
}

export function DispatchEntriesPage() {
  const [entries, setEntries] = useState<DispatchEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<DispatchEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    void fetchDispatchEntries()
      .then((dispatchEntries) => {
        if (!isMounted) {
          return;
        }

        setEntries(dispatchEntries);
        setLoadError("");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setEntries([]);
        setLoadError(error instanceof Error ? error.message : "Unable to fetch dispatch entries.");
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
    () => [...entries].sort((left, right) => `${right.date} ${right.time}`.localeCompare(`${left.date} ${left.time}`)),
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
            <CardTitle>All dispatch entries</CardTitle>
            <CardDescription>Review saved dispatch records in a card layout on mobile and a table on desktop.</CardDescription>
          </div>
          <Button asChild variant="outline">
            <Link to="/product-departure">
              <ArrowLeft />
              Back to dispatch form
            </Link>
          </Button>
        </CardHeader>
      </Card>

      {editingEntry && (
        <Card>
          <CardHeader>
            <CardTitle>Edit dispatch entry</CardTitle>
            <CardDescription>Update the selected record and save your changes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field htmlFor="edit-id" label="ID">
                <Input disabled id="edit-id" value={editingEntry.id} />
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
              <Field htmlFor="edit-token" label="Token">
                <Input
                  id="edit-token"
                  value={editingEntry.token}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, token: event.target.value } : current)
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field htmlFor="edit-challanNo" label="Challan No">
                <Input
                  id="edit-challanNo"
                  value={editingEntry.challanNo}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, challanNo: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-productCategory" label="Product Category">
                <Input
                  id="edit-productCategory"
                  value={editingEntry.productCategory}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, productCategory: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-productName" label="Product Name">
                <Input
                  id="edit-productName"
                  value={editingEntry.productName}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, productName: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-productColor" label="Product Color">
                <Input
                  id="edit-productColor"
                  value={editingEntry.productColor}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, productColor: event.target.value } : current)
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field htmlFor="edit-bagSize" label="Bag Size">
                <Input
                  id="edit-bagSize"
                  value={editingEntry.bagSize}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, bagSize: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-quantity" label="Stock">
                <Input
                  id="edit-quantity"
                  value={editingEntry.quantity}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, quantity: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-totalBags" label="Departed Bags">
                <Input
                  id="edit-totalBags"
                  value={editingEntry.totalBags}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, totalBags: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-dispatchSite" label="Dispatch Site">
                <Input
                  id="edit-dispatchSite"
                  value={editingEntry.dispatchSite}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, dispatchSite: event.target.value } : current)
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field htmlFor="edit-vehicleNo" label="Vehicle No">
                <Input
                  id="edit-vehicleNo"
                  value={editingEntry.vehicleNo}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, vehicleNo: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-driverName" label="Driver Name">
                <Input
                  id="edit-driverName"
                  value={editingEntry.driverName}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, driverName: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-driverContact" label="Driver Contact">
                <Input
                  id="edit-driverContact"
                  value={editingEntry.driverContact}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, driverContact: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-challanName" label="Challan Name">
                <Input
                  id="edit-challanName"
                  value={editingEntry.challanName}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, challanName: event.target.value } : current)
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field htmlFor="edit-dispatchTime" label="Dispatch Time">
                <Input
                  id="edit-dispatchTime"
                  value={editingEntry.dispatchTime}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, dispatchTime: event.target.value } : current)
                  }
                />
              </Field>
              <Field htmlFor="edit-todayVehicleNo" label="Today Vehicle No">
                <Input
                  id="edit-todayVehicleNo"
                  value={editingEntry.todayVehicleNo}
                  onChange={(event) =>
                    setEditingEntry((current) => current ? { ...current, todayVehicleNo: event.target.value } : current)
                  }
                />
              </Field>
            </div>

            <Field htmlFor="edit-notes" label="Notes">
              <Textarea
                id="edit-notes"
                value=""
                readOnly
                placeholder="Dispatch entry update actions are local until sheet API support is added."
              />
            </Field>

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
              ? "Loading dispatch entries from sheet..."
              : sortedEntries.length === 0
                ? "No dispatch entries have been saved yet."
                : `${sortedEntries.length} dispatch entries available.`}
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
              Add a dispatch entry first, then review it here.
            </div>
          ) : (
            <>
              <div className="space-y-4 lg:hidden">
                {paginatedEntries.map((entry) => (
                  <Card key={entry.id} className="rounded-md border shadow-none">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{buildDispatchLabel(entry) || "Dispatch entry"}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{entry.challanNo || entry.id}</p>
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
                          <p className="text-xs font-medium uppercase text-muted-foreground">Token</p>
                          <p className="mt-1">{entry.token || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Bag Size</p>
                          <p className="mt-1">{entry.bagSize || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Stock</p>
                          <p className="mt-1">{entry.quantity || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Departed Bags</p>
                          <p className="mt-1">{entry.totalBags || "-"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Vehicle</p>
                          <p className="mt-1">{entry.vehicleNo || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">Site</p>
                          <p className="mt-1">{entry.dispatchSite || "-"}</p>
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
                      <TableHead>Challan</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Bag Size</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Departed Bags</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Dispatch Site</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="max-w-[140px] truncate whitespace-nowrap text-xs text-muted-foreground" title={entry.id}>{entry.id}</TableCell>
                        <TableCell className="whitespace-nowrap" title={entry.date || "-"}>{entry.date || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap" title={entry.time || "-"}>{entry.time || "-"}</TableCell>
                        <TableCell className="max-w-[160px] truncate whitespace-nowrap" title={entry.challanNo || entry.challanName || "-"}>{entry.challanNo || entry.challanName || "-"}</TableCell>
                        <TableCell className="min-w-[220px] max-w-[220px] truncate whitespace-nowrap" title={buildDispatchLabel(entry) || "-"}>{buildDispatchLabel(entry) || "-"}</TableCell>
                        <TableCell className="max-w-[140px] truncate whitespace-nowrap" title={entry.token || "-"}>{entry.token || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap" title={entry.bagSize || "-"}>{entry.bagSize || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap" title={entry.quantity || "-"}>{entry.quantity || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap" title={entry.totalBags || "-"}>{entry.totalBags || "-"}</TableCell>
                        <TableCell className="max-w-[140px] truncate whitespace-nowrap" title={entry.vehicleNo || "-"}>{entry.vehicleNo || "-"}</TableCell>
                        <TableCell className="max-w-[140px] truncate whitespace-nowrap" title={entry.driverName || "-"}>{entry.driverName || "-"}</TableCell>
                        <TableCell className="max-w-[160px] truncate whitespace-nowrap" title={entry.dispatchSite || "-"}>{entry.dispatchSite || "-"}</TableCell>
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
