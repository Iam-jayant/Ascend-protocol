"use client";

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { FAQItem } from "@/components/FAQItem";
import { Button } from "@/components/ui/button";
import { Shield, Users, Wallet, Lock, Zap, Eye, AlertTriangle } from "lucide-react";
import ascendLogo from "@/assets/ascend-logo.png";

const Index = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsVisible(false);
      } else {
        // Scrolling up or at top
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground">
      {/* Persistent Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-6 px-4 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="w-full max-w-7xl mx-auto glass-navbar rounded-xl px-8 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <img src={ascendLogo} alt="Ascend Protocol Logo" className="w-12 h-12 glow-purple transition-transform group-hover:scale-110" />
              <span className="text-2xl font-bold gradient-text">Ascend Protocol</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>


      {/* Hero Section */}
      <section className="relative overflow-hidden pt-[250px] pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              India's First <span className="gradient-text">Crypto Inheritance</span> Protocol
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Secure your crypto assets for your loved ones with an automated dead man switch and seamless distribution to beneficiaries.
            </p>
            <Link to="/dashboard">
              <Button 
                variant="glass"
                size="default"
                className="px-6 py-5 text-base h-auto"
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Pillars of <span className="gradient-text">Ascend</span></h2>
            <p className="text-muted-foreground text-lg">Three core features protecting your digital legacy</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-card rounded-2xl p-8 border-glow hover:glow-purple transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:glow-purple transition-all">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Dead Man Switch Vaults</h3>
                <p className="text-muted-foreground">
                  Create inheritance vaults with configurable check-in periods, protecting your digital legacy with automated triggers.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-card rounded-2xl p-8 border-glow hover:glow-accent transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:glow-accent transition-all">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Multi-Beneficiary Management</h3>
                <p className="text-muted-foreground">
                  Add multiple beneficiaries with customizable share percentages to distribute assets with precision and fairness.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-card rounded-2xl p-8 border-glow hover:glow-purple transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:glow-purple transition-all">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">UPI Integration</h3>
                <p className="text-muted-foreground">
                  Seamless crypto-to-fiat conversion for Indian users, ensuring easy claim and payout through familiar UPI systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Technology Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Technology & <span className="gradient-text">Assurance</span></h2>
            <p className="text-muted-foreground text-lg">Built on robust infrastructure with security at its core</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1 */}
            <div className="group relative bg-card/40 backdrop-blur-sm rounded-3xl p-10 border-2 border-border/30 hover:border-primary/50 transition-all duration-500 hover:glow-purple">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:glow-purple transition-all">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Contracts</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Deployed on <strong>Sepolia testnet</strong> using secure Factory Pattern for individual vault deployment.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-card/40 backdrop-blur-sm rounded-3xl p-10 border-2 border-border/30 hover:border-accent/50 transition-all duration-500 hover:glow-accent">
              <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:glow-accent transition-all">
                  <Lock className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Security Focus</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Encrypted Storage, robust Input Validation, and API Rate Limiting safeguard your data.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-card/40 backdrop-blur-sm rounded-3xl p-10 border-2 border-border/30 hover:border-secondary/50 transition-all duration-500 hover:glow-accent">
              <div className="absolute inset-0 bg-gradient-secondary opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:glow-accent transition-all">
                  <Eye className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Real-Time Monitoring</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor wallet balances in real-time without requiring pre-deposited funds.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group relative bg-card/40 backdrop-blur-sm rounded-3xl p-10 border-2 border-border/30 hover:border-primary/50 transition-all duration-500 hover:glow-purple">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:glow-purple transition-all">
                  <Zap className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Testing Suite</h3>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Minutes-Based Testing</strong> mode for rapid development and demonstration cycles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked <span className="gradient-text">Questions</span></h2>
          </div>

          <div className="space-y-4">
            <FAQItem 
              question="What network is Ascend Protocol deployed on?"
              answer="We are currently deployed on the Sepolia Testnet. The system uses a comprehensive stack including Next.js, a Node.js/Express API, and RainbowKit/Wagmi for web3 connectivity."
            />
            <FAQItem 
              question="How do you handle notifications and security?"
              answer="We use an automated email system (with secure Gmail SMTP using app passwords) for vault confirmations, triggers, and sending withdrawal credentials. Security includes encrypted storage and input validation."
            />
            <FAQItem 
              question="Is the UPI integration currently functional?"
              answer="The UPI payout feature is a static demonstration only. Actual withdrawal processing and UPI connection are non-functional demo features."
            />
            <FAQItem 
              question="How does the Dead Man Switch work?"
              answer="The Dead Man Switch requires periodic check-ins. If you fail to check in within your configured period, the vault automatically triggers and distributes assets to your designated beneficiaries according to their share percentages."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img src={ascendLogo} alt="Ascend Protocol" className="w-8 h-8" />
              <span className="font-semibold">Ascend Protocol</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">License</a>
              <span>•</span>
              <span>© 2025 Ascend Protocol</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Made with ❤️ by <span className="text-primary font-semibold">Team Shunya</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
