import { Link } from "react-router-dom";
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, Eye, Settings, LogOut } from "lucide-react";
import ascendLogo from "@/assets/ascend-logo.png";

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src={ascendLogo} alt="Ascend Protocol Logo" className="w-8 h-8 glow-purple transition-transform group-hover:scale-110" />
              <span className="text-xl font-bold gradient-text">Ascend Protocol</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Wallet className="w-3 h-3 mr-1" />
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => disconnect()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Link to="/">
                  <Button variant="glass" size="sm">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your inheritance vaults and beneficiaries</p>
        </div>

        {!isConnected ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Connect Your Wallet
              </CardTitle>
              <CardDescription>
                Connect your wallet to start managing your inheritance vaults
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/">
                <Button className="w-full">
                  <Wallet className="w-4 h-4 mr-2" />
                  Go to Landing Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:glow-purple transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-primary" />
                    Create Vault
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create a new inheritance vault
                  </p>
                  <Button size="sm" className="w-full">
                    Create New Vault
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:glow-accent transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-secondary" />
                    View Vaults
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    View and manage existing vaults
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    View All Vaults
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:glow-purple transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-primary" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Manage your account settings
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Open Settings
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Vaults Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Your Inheritance Vaults</CardTitle>
                <CardDescription>
                  Overview of your active inheritance vaults
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No vaults created yet</p>
                  <p className="text-sm">Create your first inheritance vault to get started</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;