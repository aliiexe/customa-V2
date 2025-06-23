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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientData {
  id: number;
  name: string;
  totalSpent: number;
  orderCount: number;
  lastPurchase: string;
  status: "active" | "inactive";
}

export function TopClientsTable() {
  const [data, setData] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/clients/top?limit=5`);

        if (!response.ok) {
          throw new Error("Failed to fetch top clients data");
        }

        const clientsData = await response.json();
        setData(clientsData);
      } catch (error) {
        console.error("Error fetching top clients data:", error);
        setError("Unable to load clients data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client Name</TableHead>
          <TableHead className="text-right">Total Spent</TableHead>
          <TableHead className="text-right">Orders</TableHead>
          <TableHead>Last Purchase</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell className="text-right">
              ${client.totalSpent.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">{client.orderCount}</TableCell>
            <TableCell>
              {new Date(client.lastPurchase).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Badge
                variant={client.status === "active" ? "default" : "secondary"}
                className={
                  client.status === "active"
                    ? "bg-primary text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }
              >
                {client.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
