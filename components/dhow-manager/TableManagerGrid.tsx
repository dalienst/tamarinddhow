"use client";

import React, { useState } from "react";
import { Table } from "@/types/dhow";
import { Booking } from "@/types/booking";
import { Users, Plus, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface TableManagerGridProps {
  tables: Table[];
  bookings: Booking[];
  onAssignTable: (tableId: string, bookingId: string | null) => Promise<void>;
  onCreateTable: (tableNumber: string, capacity: number, description: string) => Promise<void>;
  onBulkCreateTable: (tables: { table_number: string; capacity: number; description?: string }[]) => Promise<void>;
  disabled?: boolean;
}

export const TableManagerGrid: React.FC<TableManagerGridProps> = ({
  tables,
  bookings,
  onAssignTable,
  onCreateTable,
  onBulkCreateTable,
  disabled = false,
}) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [createMode, setCreateMode] = useState<"single" | "bulk">("single");
  const [isSaving, setIsSaving] = useState(false);

  // New table form state
  const [newTableNum, setNewTableNum] = useState("");
  const [newCapacity, setNewCapacity] = useState("4");
  const [newDescription, setNewDescription] = useState("");

  // Bulk creation state
  const [bulkTables, setBulkTables] = useState<{ table_number: string; capacity: number; description: string }[]>([
    { table_number: "", capacity: 4, description: "" }
  ]);

  const addBulkRow = () => {
    setBulkTables([...bulkTables, { table_number: "", capacity: 4, description: "" }]);
  };

  const removeBulkRow = (index: number) => {
    if (isSaving) return;
    if (bulkTables.length === 1) {
      toast.error("You must have at least one table definition.");
      return;
    }
    setBulkTables(bulkTables.filter((_, idx) => idx !== index));
  };

  const updateBulkRow = (index: number, field: string, value: any) => {
    const updated = bulkTables.map((row, idx) => {
      if (idx === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setBulkTables(updated);
  };

  const handleAssign = async () => {
    if (!selectedTable) return;
    try {
      await onAssignTable(selectedTable.id, selectedBookingId || null);
      toast.success(
        selectedBookingId
          ? `Table ${selectedTable.table_number} assigned!`
          : `Table ${selectedTable.table_number} cleared!`
      );
      setSelectedTable(null);
    } catch (err: any) {
      toast.error("Failed to update table assignment.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum) {
      toast.error("Please enter a table number.");
      return;
    }
    setIsSaving(true);
    try {
      await onCreateTable(newTableNum, parseInt(newCapacity, 10), newDescription);
      toast.success(`Table ${newTableNum} created!`);
      setNewTableNum("");
      setNewDescription("");
      setIsCreating(false);
    } catch (err) {
      // Handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < bulkTables.length; i++) {
      if (!bulkTables[i].table_number.trim()) {
        toast.error(`Please fill in Table Number for row ${i + 1}.`);
        return;
      }
      if (bulkTables[i].capacity < 1) {
        toast.error(`Capacity must be at least 1 for row ${i + 1}.`);
        return;
      }
    }
    setIsSaving(true);
    try {
      await onBulkCreateTable(
        bulkTables.map(t => ({
          table_number: t.table_number.trim(),
          capacity: Number(t.capacity),
          description: t.description.trim() || undefined
        }))
      );
      toast.success(`Tables successfully generated!`);
      setBulkTables([{ table_number: "", capacity: 4, description: "" }]);
      setIsCreating(false);
    } catch (err) {
      // Handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      {!disabled && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsCreating(!isCreating)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? "Cancel" : "Add Table"}
          </button>
        </div>
      )}

      {/* Create Table Form */}
      {isCreating && (
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/30 pb-2">
            <h3 className="font-semibold text-amber-900 text-sm">Add New Table to Sailing</h3>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold border border-slate-200">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setCreateMode("single")}
                className={`px-3 py-1 rounded-md transition-all ${
                  createMode === "single" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                } disabled:opacity-60`}
              >
                Single Table
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setCreateMode("bulk")}
                className={`px-3 py-1 rounded-md transition-all ${
                  createMode === "bulk" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
                } disabled:opacity-60`}
              >
                Bulk Generate
              </button>
            </div>
          </div>

          {createMode === "single" ? (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Table Number/Name</label>
                  <input
                    type="text"
                    disabled={isSaving}
                    placeholder="e.g. T1, T2, Deck-1"
                    value={newTableNum}
                    onChange={(e) => setNewTableNum(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    disabled={isSaving}
                    min="1"
                    max="20"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Description / Location</label>
                  <input
                    type="text"
                    disabled={isSaving}
                    placeholder="e.g. Window seat, Front Deck"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    Saving...
                  </>
                ) : (
                  "Save Table"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleBulkCreate} className="space-y-4">
              <div className="space-y-3">
                {bulkTables.map((row, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-end gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative">
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Table Number/Name</label>
                      <input
                        type="text"
                        disabled={isSaving}
                        placeholder="e.g. T1, T2"
                        required
                        value={row.table_number}
                        onChange={(e) => updateBulkRow(index, "table_number", e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white disabled:opacity-60"
                      />
                    </div>
                    <div className="w-full sm:w-28">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Capacity</label>
                      <input
                        type="number"
                        disabled={isSaving}
                        min="1"
                        max="20"
                        required
                        value={row.capacity}
                        onChange={(e) => updateBulkRow(index, "capacity", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white disabled:opacity-60"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description / Location</label>
                      <input
                        type="text"
                        disabled={isSaving}
                        placeholder="e.g. Left window"
                        value={row.description}
                        onChange={(e) => updateBulkRow(index, "description", e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white disabled:opacity-60"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => removeBulkRow(index)}
                      className="px-3 py-2 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={addBulkRow}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-300 disabled:opacity-60"
                >
                  + Add Table Row
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                      Generating...
                    </>
                  ) : (
                    "Generate Tables"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((tbl) => {
          const isAssigned = !!tbl.assigned_to;
          return (
            <div
              key={tbl.id}
              onClick={() => {
                if (disabled) return;
                setSelectedTable(tbl);
                setSelectedBookingId(tbl.assigned_to || "");
              }}
              className={`border rounded-xl p-4 transition-all ${
                disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"
              } ${
                selectedTable?.id === tbl.id
                  ? "ring-2 ring-amber-500 border-amber-500 bg-amber-50/30"
                  : isAssigned
                  ? "border-emerald-200 bg-emerald-50/40 hover:border-emerald-350"
                  : "border-slate-200 bg-white hover:border-slate-350"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 text-lg">Table {tbl.table_number}</span>
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                  <Users className="w-3.5 h-3.5" />
                  {tbl.capacity} seats
                </span>
              </div>

              {tbl.description && (
                <p className="text-xs text-slate-500 mb-3">{tbl.description}</p>
              )}

              {isAssigned ? (
                <div className="mt-3 pt-2 border-t border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Assigned ({tbl.booking_reference || "Booking"})</span>
                </div>
              ) : (
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                  <AlertCircle className="w-4 h-4 text-slate-300" />
                  <span>Available</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal / Assignment Sheet for Selected Table */}
      {selectedTable && (
        <div className="bg-slate-800 text-white rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-lg">
            Assign Booking to Table {selectedTable.table_number} ({selectedTable.capacity} seats)
          </h3>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Guest Booking</label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- No Booking (Mark Available) --</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.reference} — {b.booked_by_name || b.booked_by_email} ({b.party_size} pax) {b.table_request ? `[Req: ${b.table_request}]` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAssign}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-sm transition-colors"
            >
              Save Assignment
            </button>
            <button
              onClick={() => setSelectedTable(null)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium rounded-lg text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
