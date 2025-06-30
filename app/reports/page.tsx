"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Printer,
  Share2,
  FileText,
  Calendar,
  BarChart3,
  Package,
  Users,
  Building2,
} from "lucide-react";
import SalesReports from "@/components/reports/sales-reports";
import ProductReports from "@/components/reports/product-reports";
import ClientReports from "@/components/reports/client-reports";
import SupplierReports from "@/components/reports/supplier-reports";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { exportToPdf } from "@/lib/pdf-export";

// Fix: DateRange type should match what DatePickerWithRange expects
type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("sales");
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Fix: Use Date | undefined for from/to to match DatePickerWithRange
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const { toast } = useToast();

  const reportTitles = {
    sales: "Sales Reports",
    products: "Product Reports",
    clients: "Client Reports",
    suppliers: "Supplier Reports",
  };

  const tabConfig = [
    {
      value: "sales",
      label: "Sales",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      value: "products",
      label: "Products",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      value: "clients",
      label: "Clients",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      value: "suppliers",
      label: "Suppliers",
      icon: Building2,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const reportElement = document.getElementById("report-content");
      if (!reportElement) throw new Error("Report content not found");

      // Fix: Use fallback for undefined dates
      const from = dateRange.from
        ? format(dateRange.from, "MMM dd, yyyy")
        : "N/A";
      const to = dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : "N/A";
      const filename = `${
        reportTitles[activeTab as keyof typeof reportTitles]
      } - ${from} to ${to}.pdf`;
      await exportToPdf(reportElement, filename);

      toast({
        title: "Export Successful",
        description: "Report has been exported as PDF successfully",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Could not export the report as PDF",
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
          title: `${
            reportTitles[activeTab as keyof typeof reportTitles]
          } - Business Analytics`,
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

  const renderTabContent = () => {
    // Provide fallback dates if from/to are undefined
    const safeDateRange = {
      from: dateRange.from ?? new Date(new Date().getFullYear(), 0, 1),
      to: dateRange.to ?? new Date(),
    };

    switch (activeTab) {
      case "sales":
        return <SalesReports dateRange={safeDateRange} />;
      case "products":
        return <ProductReports />;
      case "clients":
        return <ClientReports dateRange={safeDateRange} />;
      case "suppliers":
        return <SupplierReports dateRange={safeDateRange} />;
      default:
        return <SalesReports dateRange={safeDateRange} />;
    }
  };

  const currentTab = tabConfig.find((tab) => tab.value === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Reports Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive business analytics and insights
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Generating..." : "Export PDF"}
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={isPrinting}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={isSharing}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Calendar className="h-5 w-5" />
            <span>Report Period:</span>
          </div>
          {/* Fix: setDateRange is compatible with DatePickerWithRange's onUpdate */}
          <DatePickerWithRange dateRange={dateRange} onUpdate={setDateRange} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`
                    flex items-center gap-3 px-6 py-4 text-sm font-medium border-b-2 transition-all min-w-0 flex-1
                    ${
                      isActive
                        ? `border-blue-500 ${tab.color} bg-blue-50`
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-semibold truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Header */}
        {currentTab && (
          <div className={`p-6 border-b ${currentTab.bgColor}`}>
            <div className="flex items-center gap-3">
              <currentTab.icon className={`h-6 w-6 ${currentTab.color}`} />
              <div>
                <h2 className={`text-2xl font-bold ${currentTab.color}`}>
                  {reportTitles[activeTab as keyof typeof reportTitles]}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Period:{" "}
                  {dateRange.from
                    ? format(dateRange.from, "MMM dd, yyyy")
                    : "N/A"}{" "}
                  -{" "}
                  {dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div id="report-content" className="p-6 bg-white">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
