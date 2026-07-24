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
  disabled?: boolean;
}

export const TableManagerGrid: React.FC<TableManagerGridProps> = ({
  tables,
  bookings,
  onAssignTable,
  onCreateTable,
  disabled = false,
}) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  // New table form state
  const [newTableNum, setNewTableNum] = useState("");
  const [newCapacity, setNewCapacity] = useState("4");
  const [newDescription, setNewDescription] = useState("");

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
    try {
      await onCreateTable(newTableNum, parseInt(newCapacity, 10), newDescription);
      toast.success(`Table ${newTableNum} created!`);
      setNewTableNum("");
      setNewDescription("");
      setIsCreating(false);
    } catch (err) {
      toast.error("Failed to create table.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      {!disabled && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? "Cancel" : "Add Table"}
          </button>
        </div>
      )}

      {/* Create Table Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-amber-900 text-sm">Add New Table to Sailing</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Table Number/Name</label>
              <input
                type="text"
                placeholder="e.g. T1, T2, Deck-1"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Capacity (Seats)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description / Location</label>
              <input
                type="text"
                placeholder="e.g. Window seat, Front Deck"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            Save Table
          </button>
        </form>
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
