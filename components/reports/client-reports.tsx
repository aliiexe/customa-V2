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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ClientsSpendingChart } from "@/components/reports/clients-spending-chart";
import { TopClientsTable } from "@/components/reports/top-clients-table";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientData {
  totalClients: number;
  activeClients: number;
  avgLifetimeValue: number;
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
        if (!response.ok)
          throw new Error("Failed to fetch client contributions");
        setData(await response.json());
      } catch (err) {
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
      </div>
    );
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">% of CA</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((client) => (
          <TableRow key={client.id}>
            <TableCell>{client.name}</TableCell>
            <TableCell className="text-right">
              {client.revenue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
              })}
            </TableCell>
            <TableCell className="text-right">{client.percentage}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function ClientReports() {
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports/clients`);

        if (!response.ok) {
          throw new Error("Failed to fetch client data");
        }

        const clientData = await response.json();
        setData(clientData);
      } catch (error) {
        console.error("Error fetching client data:", error);
        setError("Unable to load client data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">Client Reports</h2>
        <Button
          variant="outline"
          className="border-primary hover:bg-primary/10"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-primary">
                {data?.totalClients || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-primary">
                  {data?.activeClients || 0}
                </div>
                <p className="text-gray-500 text-sm">
                  Ordered in last 3 months
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Avg. Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(data?.avgLifetimeValue || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Client Spending Trends</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <ClientsSpendingChart />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Top Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <TopClientsTable />
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Client Contribution to Revenue</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <ClientContributionsTable />
        </CardContent>
      </Card>
    </div>
  );
}
