"use client"

import { ArrowRight, Zap, Shield, GitBranch, CheckCircle, Users, Cloud, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect"
import { Navbar, NavBody, NavItems, MobileNav, MobileNavHeader, MobileNavToggle, MobileNavMenu } from "@/components/ui/animated-navbar"
import Link from "next/link"
import Particles from "@/components/Particles"
import { useState } from "react"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Features", link: "#features" },
    { name: "How It Works", link: "#how-it-works" },
    { name: "Security", link: "#security" },
  ];

  return (
    <div className="dark min-h-screen bg-gradient-to-b from-background via-background to-primary/5 relative">
      {/* Background Particles */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={['#6366f1', '#8b5cf6', '#06b6d4']}
          particleCount={150}
          particleSpread={15}
          speed={0.05}
          particleBaseSize={2}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      {/* Animated Navigation */}
      <Navbar>
        <NavBody>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Cloud className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Nebula-Cloud</span>
          </div>
          <NavItems items={navItems} />
          <Link href="/editor">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Start Building</Button>
          </Link>
        </NavBody>
        <MobileNav>
          <MobileNavHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">Nebula-Cloud</span>
            </div>
            <MobileNavToggle 
              isOpen={mobileMenuOpen} 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            />
          </MobileNavHeader>
          <MobileNavMenu 
            isOpen={mobileMenuOpen} 
            onClose={() => setMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                className="text-foreground hover:text-primary transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <Link href="/editor" onClick={() => setMobileMenuOpen(false)}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full mt-4">
                Start Building
              </Button>
            </Link>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Content */}
      <div className="relative z-10 pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 sm:pt-32 sm:pb-40 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">AI-Powered Infrastructure Design</span>
          </div>

          <TypewriterEffectSmooth 
            words={[
              { text: "AI", className: "text-primary" },
              { text: "Infrastructure" },
              { text: "from", className: "text-muted-foreground" },
              { text: "Text", className: "text-[#60a5fa]" },
              { text: "to", className: "text-muted-foreground" },
              { text: "Code", className: "text-[#1d4ed8]" }
            ]}
            className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6"
            cursorClassName="bg-primary"
          />

          <TypewriterEffectSmooth 
            words={[
              { text: "Generate" },
              { text: "production-ready", className: "text-[#3b82f6]" },
              { text: "Infrastructure" },
              { text: "as", className: "text-muted-foreground" },
              { text: "Code", className: "text-secondary" },
              { text: "instantly", className: "text-primary" },
              { text: "with", className: "text-muted-foreground" },
              { text: "AI", className: "text-primary" }
            ]}
            className="text-xl sm:text-2xl mb-8 max-w-2xl mx-auto"
            cursorClassName="bg-secondary"
          />

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Link href="/editor">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-base h-12 px-8 group"
              >
                Start Building Infrastructure
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-card text-base h-12 px-8 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8 border-t border-border/40 mt-12 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div>
              <div className="text-2xl font-bold text-primary mb-1">50ms</div>
              <p className="text-sm text-muted-foreground">Avg Generation Time</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">99.9%</div>
              <p className="text-sm text-muted-foreground">Accuracy Rate</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">10K+</div>
              <p className="text-sm text-muted-foreground">Diagrams Created</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30 border-y border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 text-center">
            The Problem with Manual Infrastructure Design
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Time-Consuming & Error-Prone
              </h3>
              <p className="text-muted-foreground">
                Manual diagram creation and IaC writing takes days. One mistake compounds across your entire
                infrastructure.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Diagram-Code Sync Issues
              </h3>
              <p className="text-muted-foreground">
                When your diagram changes, your code gets out of sync. Keeping both updated is a nightmare.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Security & Compliance Gaps
              </h3>
              <p className="text-muted-foreground">
                Missing best practices and compliance requirements. No automated validation or security checks.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Team Collaboration Issues
              </h3>
              <p className="text-muted-foreground">
                Architects, DevOps, and developers speak different languages. Alignment is difficult.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to design, build, and deploy with confidence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Text-to-Infrastructure",
                description:
                  "Describe your infrastructure in natural language. AI instantly generates diagrams and code.",
              },
              {
                icon: GitBranch,
                title: "Auto IaC Generation",
                description: "Get production-ready Terraform, CloudFormation, and Pulumi code automatically generated.",
              },
              {
                icon: ArrowRight,
                title: "Bi-directional Sync",
                description:
                  "Edit your diagram or code—changes sync instantly in both directions. Perfect alignment always.",
              },
              {
                icon: Shield,
                title: "Security & Compliance",
                description: "Built-in ISO 27001, GDPR, HIPAA validation. Enforce least privilege by default.",
              },
              {
                icon: Cloud,
                title: "Manual Editing",
                description: "Drag-and-drop editor for fine-tuning. Visual controls with real-time code preview.",
              },
              {
                icon: CheckCircle,
                title: "Best Practices",
                description: "Automated validation against industry best practices. Real-time suggestions and alerts.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <feature.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-foreground mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-card/40 border-y border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-center mb-16">How It Works</h2>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Describe Your Infrastructure",
                description:
                  'Simply describe what you need in plain English. "I need a three-tier app with RDS, ALB, and autoscaling EC2 instances in a VPC"',
              },
              {
                step: "02",
                title: "AI Generates Diagram & Code",
                description:
                  "Our AI instantly creates a visual diagram and generates IaC code in your preferred framework (Terraform, CloudFormation, Pulumi, etc.)",
              },
              {
                step: "03",
                title: "Edit & Visualize",
                description:
                  "Use the drag-and-drop editor to refine your infrastructure. See the code update in real-time as you make changes.",
              },
              {
                step: "04",
                title: "Validate & Deploy",
                description:
                  "Automatic security and compliance checks ensure best practices. Export code and deploy with confidence.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 md:gap-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-lg mb-4 flex-shrink-0">
                    {item.step}
                  </div>
                  {idx < 3 && <div className="w-1 h-16 bg-gradient-to-b from-primary to-secondary/30 mt-4"></div>}
                </div>
                <div className="pt-2 pb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">Enterprise-Grade Security</h2>
            <p className="text-lg text-muted-foreground">Built for regulated industries and security-conscious teams</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                { icon: Lock, title: "Least Privilege", desc: "Automatic enforcement of minimal access permissions" },
                { icon: Shield, title: "Encryption", desc: "End-to-end encryption for data at rest and in transit" },
                { icon: CheckCircle, title: "Compliance", desc: "ISO 27001, GDPR, HIPAA, SOC 2 validated" },
                { icon: Zap, title: "Audit Logging", desc: "Complete audit trail of all infrastructure changes" },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <item.icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-lg p-8 text-center">
              <div className="text-5xl font-bold text-primary mb-2">SOC 2</div>
              <p className="text-muted-foreground mb-6">Type II Certified</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {["ISO 27001", "GDPR", "HIPAA", "SOC 2"].map((cert, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 bg-card border border-border rounded-md text-sm font-medium text-foreground"
                  >
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/30 border-y border-border/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground text-center mb-16">Built for Every Role</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: "Cloud Architects",
                items: ["Design at scale", "Multi-cloud support", "Team collaboration"],
              },
              {
                icon: GitBranch,
                title: "DevOps Engineers",
                items: ["Infrastructure automation", "IaC best practices", "CI/CD integration"],
              },
              {
                icon: Zap,
                title: "Developers",
                items: ["Fast prototyping", "Infrastructure as code", "Easy collaboration"],
              },
              {
                icon: Cloud,
                title: "Platform Teams",
                items: ["Standardization", "Governance enforcement", "Self-service infrastructure"],
              },
            ].map((role, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
              >
                <role.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-4 text-lg">{role.title}</h3>
                <ul className="space-y-2">
                  {role.items.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Ready to Build Smarter?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start designing production-grade infrastructure in minutes. No credit card required.
          </p>
          <Link href="/editor">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-base h-12 px-12 group"
            >
              Start Building Infrastructure Now
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-lg"></div>
                <span className="font-bold text-foreground">Nebula-Cloud</span>
              </div>
              <p className="text-sm text-muted-foreground">Infrastructure design meets AI intelligence.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2026 Nebula-Cloud. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-foreground transition">
                Twitter
              </a>
              <a href="#" className="hover:text-foreground transition">
                LinkedIn
              </a>
              <a href="#" className="hover:text-foreground transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}