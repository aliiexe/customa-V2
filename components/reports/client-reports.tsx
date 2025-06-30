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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSpreadsheet,
  Users,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { ClientsSpendingChart } from "@/components/reports/clients-spending-chart";
import { TopClientsTable } from "@/components/reports/top-clients-table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface ClientData {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  newClientsThisMonth: number;
  avgLifetimeValue: number;
  retentionRate: number;
}

interface ClientReportsProps {
  dateRange: { from: Date; to: Date };
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

  if (error) return <div className="text-red-500">{error}</div>;

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
              {client.revenue.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
              })}
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

export default function ClientReports({ dateRange }: ClientReportsProps) {
  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const startDate = dateRange.from.toISOString().split("T")[0];
        const endDate = dateRange.to.toISOString().split("T")[0];

        const response = await fetch(
          `/api/reports/clients?startDate=${startDate}&endDate=${endDate}`
        );

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
  }, [dateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleExportCSV = async () => {
    try {
      if (!data) {
        console.error("No client data available for export");
        return;
      }

      // Fetch detailed client data
      const [topClientsResponse, contributionsResponse] = await Promise.all([
        fetch("/api/reports/clients/top?limit=50"),
        fetch("/api/reports/clients/contributions"),
      ]);

      let topClients = [];
      let contributions = [];

      if (topClientsResponse.ok) {
        topClients = await topClientsResponse.json();
      }

      if (contributionsResponse.ok) {
        contributions = await contributionsResponse.json();
      }

      // Create comprehensive CSV data
      const csvData = [
        // Summary data
        ["Client Analytics Summary"],
        [""],
        ["Metric", "Value"],
        ["Total Clients", data.totalClients.toString()],
        ["Active Clients", data.activeClients.toString()],
        ["Total Revenue", `$${data.totalRevenue.toLocaleString()}`],
        ["New Clients This Month", data.newClientsThisMonth.toString()],
        ["Average Lifetime Value", `$${data.avgLifetimeValue.toFixed(2)}`],
        ["Retention Rate %", `${data.retentionRate.toFixed(1)}%`],
        [
          "Period",
          `${format(dateRange.from, "yyyy-MM-dd")} to ${format(
            dateRange.to,
            "yyyy-MM-dd"
          )}`,
        ],
        ["Generated At", new Date().toLocaleString()],
        [""],
        // Top clients data
        ["Top Clients by Revenue"],
        [""],
        [
          "Client Name",
          "Total Spent",
          "Order Count",
          "Last Purchase",
          "Status",
        ],
      ];

      // Add top clients details
      topClients.forEach((client: any) => {
        csvData.push([
          client.name || "",
          `$${client.totalSpent?.toLocaleString() || "0"}`,
          client.orderCount?.toString() || "0",
          client.lastPurchase
            ? format(new Date(client.lastPurchase), "yyyy-MM-dd")
            : "Never",
          client.status || "",
        ]);
      });

      const csvContent = csvData
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `client-report-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("Client report exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">
            Client Analytics
          </h2>
          <p className="text-gray-500">
            {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
          </p>
        </div>
        <Button
          variant="outline"
          className="border-primary hover:bg-primary/10"
          onClick={handleExportCSV}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Client Data
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {data?.totalClients || 0}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    All registered clients
                  </span>
                </div>
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
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {data?.activeClients || 0}
                  <span className="text-sm ml-2 text-gray-500">
                    ({Math.round(data?.retentionRate || 0)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Ordered in last 3 months
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>New Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-600">
                  {data?.newClientsThisMonth || 0}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Added this month
                  </span>
                </div>
              </div>
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
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(data?.avgLifetimeValue || 0)}
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Revenue per client
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Client Spending Trends</CardTitle>
          <CardDescription>Monthly spending patterns</CardDescription>
        </CardHeader>
        <CardContent className="bg-white pt-6">
          <ClientsSpendingChart />
        </CardContent>
      </Card>

      {/* <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b flex flex-row justify-between items-center">
          <div>
            <CardTitle>Top Clients by Revenue</CardTitle>
            <CardDescription>Your most valuable clients</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/clients")}
          >
            View All Clients
          </Button>
        </CardHeader>
        <CardContent className="bg-white pt-6">
          <TopClientsTable />
        </CardContent>
      </Card> */}

      <Card className="bg-white shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle>Client Contribution to Revenue</CardTitle>
          <CardDescription>Revenue distribution among clients</CardDescription>
        </CardHeader>
        <CardContent className="bg-white pt-6">
          <ClientContributionsTable />
        </CardContent>
      </Card>
    </div>
  );
}
