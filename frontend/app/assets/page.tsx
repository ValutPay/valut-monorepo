"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useUserBalance } from "@/hooks";

// Asset data structure
interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  value: number;
  icon: string;
  network: string;
  address: string;
}

export default function AssetsPage() {
  const { usdtBalance, USDT_TO_INR_RATE, isLoading, setDefaultAsset, defaultAsset } = useUserBalance();
  const [selectedAsset, setSelectedAsset] = useState<string>(defaultAsset || "usdt");
  const [activeTab, setActiveTab] = useState<string>("assets");
  
  // Dummy asset data - in a real app, this would come from your backend
  const assets: Asset[] = [
    {
      id: "usdt",
      symbol: "USDT",
      name: "Tether USD",
      balance: usdtBalance,
      value: usdtBalance * USDT_TO_INR_RATE,
      icon: "💵",
      network: "Sepolia",
      address: "0x123...456"
    },
    {
      id: "usdc",
      symbol: "USDC",
      name: "USD Coin",
      balance: 0,
      value: 0,
      icon: "💰",
      network: "Sepolia",
      address: "0x789...012"
    },
    {
      id: "dai",
      symbol: "DAI",
      name: "Dai Stablecoin",
      balance: 0,
      value: 0,
      icon: "🪙",
      network: "Sepolia",
      address: "0x345...678"
    }
  ];

  const handleDefaultAssetChange = (value: string) => {
    setSelectedAsset(value);
    setDefaultAsset(value);
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/" className="text-gray-700 mr-2">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold">My Assets</h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setActiveTab("settings")}
          aria-label="Settings"
        >
          <Settings size={20} className="text-gray-600" />
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="settings">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading assets...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    ₹{(usdtBalance * USDT_TO_INR_RATE).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-gray-500 text-sm">
                    ${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Assets</CardTitle>
                    <Link href="/add-funds">
                      <Button variant="secondary" size="sm">
                        Deposit
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg mr-2">
                                {asset.icon}
                              </div>
                              <div>
                                <div className="font-medium">{asset.symbol}</div>
                                <div className="text-xs text-gray-500">{asset.name}</div>
                              </div>
                              {asset.id === defaultAsset && (
                                <Star size={16} className="ml-2 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{asset.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                            <div className="text-xs text-gray-500">{asset.network}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{asset.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Default Display Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedAsset} 
                onValueChange={handleDefaultAssetChange}
                className="space-y-4"
              >
                {assets.map((asset) => (
                  <div key={asset.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={asset.id} id={asset.id} />
                    <Label htmlFor={asset.id} className="flex items-center cursor-pointer">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg mr-2">
                        {asset.icon}
                      </div>
                      <div>
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-xs text-gray-500">{asset.name}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <p className="text-sm text-gray-500 mt-4">
                The selected asset will be shown by default on your home and send screens.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
