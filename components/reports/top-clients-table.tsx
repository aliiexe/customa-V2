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
import { useCurrency } from "@/lib/currency-provider";
import { format } from "date-fns";
import Link from "next/link";

interface TopClient {
  id: number;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  lastPurchase: string | null;
  status: "active" | "inactive";
}

export function TopClientsTable() {
  const [clients, setClients] = useState<TopClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopClients = async () => {
      try {
        setLoading(true);
        console.log("Fetching top clients data");
        const response = await fetch("/api/reports/clients/top?limit=10");

        if (!response.ok) {
          throw new Error("Server error");
        }

        const data = await response.json();
        console.log("Top clients data received:", data);
        setClients(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching top clients:", error);
        setError("Unable to load clients data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopClients();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error}
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="text-gray-500">
          No revenue data available yet
        </div>
        <div className="text-sm text-gray-400">
          Client revenue will appear here once you have processed paid invoices
        </div>
        <Link
          href="/invoices/client/new"
          className="text-primary hover:underline text-sm inline-block"
        >
          Create an invoice →
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead className="text-right">Total Spent</TableHead>
            <TableHead className="text-right">Orders</TableHead>
            <TableHead>Last Purchase</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div>
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {client.name}
                  </Link>
                  <div className="text-sm text-gray-500">{client.email}</div>
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                ${client.totalSpent.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">{client.orderCount}</TableCell>
              <TableCell>
                {client.lastPurchase ? (
                  format(new Date(client.lastPurchase), "MMM dd, yyyy")
                ) : (
                  <span className="text-gray-400">Never</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={client.status === "active" ? "default" : "secondary"}
                >
                  {client.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ClientContributionsTable() {
  const [data, setData] = useState<
    { id: number; name: string; revenue: number; percentage: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/reports/clients/contributions");

        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.error) {
            throw new Error(errorData.error);
          }
          throw new Error("Failed to fetch client contributions");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error:", err);
        setError("Unable to load client contributions.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div>
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center py-8">{error}</div>;

  if (data.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="text-gray-500">
          No revenue contributions available yet.
        </div>
        <div className="text-sm text-gray-400">
          Revenue contributions will appear here once you have clients with paid
          invoices.
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">% of Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((client) => (
          <TableRow key={client.id}>
            <TableCell>{client.name}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(client.revenue)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min(100, client.percentage)}%` }}
                  />
                </div>
                <span>{client.percentage.toFixed(1)}%</span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
