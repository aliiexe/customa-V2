"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Client } from "@/types/models";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ClientWithStats extends Client {
  totalOrders: number;
  totalSpent: number;
  outstandingBalance: number;
}

export default function ClientsTable() {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        setError("Failed to load clients");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Error loading clients");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedClients = [...clients].sort((a: any, b: any) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (typeof aValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
  });

  const handleDelete = async () => {
    if (!clientToDelete) return;

    try {
      const response = await fetch(`/api/clients/${clientToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setClients(clients.filter((client) => client.id !== clientToDelete));
      } else {
        alert(data.error || "Failed to delete client");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("An error occurred while deleting the client");
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const openDeleteDialog = (id: number) => {
    setClientToDelete(id);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading clients...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name{" "}
                {sortColumn === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead
                className="cursor-pointer text-center"
                onClick={() => handleSort("invoiceCount")}
              >
                Orders{" "}
                {sortColumn === "invoiceCount" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("totalSpent")}
              >
                Total Spent{" "}
                {sortColumn === "totalSpent" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer text-right"
                onClick={() => handleSort("unpaidAmount")}
              >
                Outstanding{" "}
                {sortColumn === "unpaidAmount" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              sortedClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phoneNumber}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {client.invoiceCount || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${(client.totalSpent || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {(client.unpaidAmount || 0) > 0 ? (
                      <Badge variant="destructive">
                        ${(client.unpaidAmount || 0).toFixed(2)}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">$0.00</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/clients/${client.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/clients/${client.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteDialog(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the client. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
