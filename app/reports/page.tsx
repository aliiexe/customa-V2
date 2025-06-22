"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, FileText } from "lucide-react";
import SalesReports from "@/components/reports/sales-reports";
import ProductReports from "@/components/reports/product-reports";
import ClientReports from "@/components/reports/client-reports";
import SupplierReports from "@/components/reports/supplier-reports";
import { exportToPdf } from "@/lib/pdf-export";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("sales");
  const [isExporting, setIsExporting] = useState(false);

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
      // Get the current report content
      const reportElement = document.getElementById("report-content");
      if (reportElement) {
        await exportToPdf(
          reportElement,
          `${reportTitles[activeTab as keyof typeof reportTitles]}.pdf`
        );
      }
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Reports Dashboard
        </h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="border-primary hover:bg-primary/10"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
          <Button
            variant="outline"
            className="border-primary hover:bg-primary/10"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            className="border-primary hover:bg-primary/10"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardHeader className="bg-secondary/50 border-b">
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
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-8 bg-secondary/50 p-1">
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

            <div id="report-content" className="bg-white p-1">
              <TabsContent value="sales">
                <SalesReports />
              </TabsContent>

              <TabsContent value="products">
                <ProductReports />
              </TabsContent>

              <TabsContent value="clients">
                <ClientReports />
              </TabsContent>

              <TabsContent value="suppliers">
                <SupplierReports />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
