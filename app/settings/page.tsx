"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/lib/theme-provider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // Theme options
  const themes = [
    { id: "green", name: "Green", color: "#16A249" },
    { id: "red", name: "Red", color: "#FE4D50" },
    { id: "purple", name: "Purple", color: "#8C4DFE" },
    { id: "blue", name: "Blue", color: "#4DAEFE" },
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-primary mb-8 flex items-center">
        Settings
      </h1>

      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize the color theme of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Choose a theme color</p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {themes.map((t) => (
                    <div
                      key={t.id}
                      onClick={() =>
                        setTheme(t.id as "green" | "red" | "purple" | "blue")
                      }
                      className={`flex cursor-pointer flex-col items-center rounded-md border p-4 hover:border-primary transition-all ${
                        theme === t.id ? "border-2 border-primary" : ""
                      }`}
                    >
                      <div
                        className="mb-2 h-10 w-10 rounded-full"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="text-sm font-medium">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-500">
                Account settings coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control your notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-500">
                Notification settings coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
