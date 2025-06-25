"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, FileText, Calendar } from "lucide-react";
import SalesReports from "@/components/reports/sales-reports";
import ProductReports from "@/components/reports/product-reports";
import ClientReports from "@/components/reports/client-reports";
import SupplierReports from "@/components/reports/supplier-reports";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("sales");
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    to: new Date(),
  });
  const { toast } = useToast();

  // Define report titles for export
  const reportTitles = {
    sales: "Sales Reports",
    products: "Product Reports",
    clients: "Client Reports",
    suppliers: "Supplier Reports",
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Create comprehensive report data
      const reportData = {
        reportType: reportTitles[activeTab as keyof typeof reportTitles],
        dateRange: {
          from: format(dateRange.from, "yyyy-MM-dd"),
          to: format(dateRange.to, "yyyy-MM-dd"),
        },
        generatedAt: new Date().toISOString(),
        data: `Report for ${activeTab} from ${format(
          dateRange.from,
          "PPP"
        )} to ${format(dateRange.to, "PPP")}`,
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab}-report-${format(new Date(), "yyyy-MM-dd")}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Report has been exported successfully",
      });
    } catch (error) {
      console.error("Error exporting:", error);
      toast({
        title: "Export Failed",
        description: "Could not export the report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    try {
      window.print();
      toast({
        title: "Print Initiated",
        description: "Print dialog opened successfully",
      });
    } catch (error) {
      toast({
        title: "Print Failed",
        description: "Could not open print dialog",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: reportTitles[activeTab as keyof typeof reportTitles],
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Report URL has been copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Sharing Failed",
        description: "Could not share the report",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Reports Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive business analytics and insights
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="border-primary hover:bg-primary/10"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={isPrinting}
            className="border-primary hover:bg-primary/10"
          >
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? "Printing..." : "Print"}
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={isSharing}
            className="border-primary hover:bg-primary/10"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {isSharing ? "Sharing..." : "Share"}
          </Button>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 text-primary">
          <Calendar className="h-5 w-5" />
          <span className="font-medium">Report period: </span>
        </div>
        <div className="ml-4">
          <DatePickerWithRange
            dateRange={dateRange}
            onUpdate={handleDateRangeChange}
          />
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <CardTitle className="text-xl font-semibold text-primary flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            {reportTitles[activeTab as keyof typeof reportTitles]}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <Tabs
            defaultValue="sales"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-8 bg-secondary/50 p-1">
              <TabsTrigger
                value="sales"
                className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium"
              >
                Sales
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium"
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="clients"
                className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium"
              >
                Clients
              </TabsTrigger>
              <TabsTrigger
                value="suppliers"
                className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium"
              >
                Suppliers
              </TabsTrigger>
            </TabsList>

            <div id="report-content" className="bg-white">
              <TabsContent value="sales" className="mt-0">
                <SalesReports dateRange={dateRange} />
              </TabsContent>

              <TabsContent value="products" className="mt-0">
                <ProductReports />
              </TabsContent>

              <TabsContent value="clients" className="mt-0">
                <ClientReports dateRange={dateRange} />
              </TabsContent>

              <TabsContent value="suppliers" className="mt-0">
                <SupplierReports dateRange={dateRange} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
