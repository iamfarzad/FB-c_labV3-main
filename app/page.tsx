import { PageHeader, PageShell } from "@/components/page-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookCallButton } from '@/components/meeting/BookCallButton'
import Link from "next/link"
import { ArrowRight, Lightbulb, Star, Users, CheckCircle, TrendingUp, Zap, Brain } from "lucide-react"
import { FbcIcon } from "@/components/ui/fbc-icon"
import { FbcIcon as FbcIconPolished } from "@/components/ui/fbc-icon"
import { ClientBrain, ClientZap, ClientSparkles, ClientTarget } from "@/components/ui/client-icons"
import type { Metadata } from "next"
import { MotionCard } from "@/components/ui/motion-card"
import { FadeIn } from "@/components/ui/fade-in"
import { ProgressTracker } from "@/components/experience/progress-tracker"
import { CitationsDemo } from "@/components/experience/citations-demo"

export const metadata: Metadata = {
  title: "Farzad Bayat - AI Consultant & Automation Expert | Build AI That Actually Works",
  description: "Expert AI consultant with 10,000+ hours experience. I build practical AI automation solutions that deliver real business results. From chatbots to workflow automation - AI that works.",
  keywords: ["AI consultant", "AI automation", "artificial intelligence", "business automation", "AI implementation", "Farzad Bayat"],
  openGraph: {
    title: "Farzad Bayat - AI Consultant & Automation Expert | Build AI That Actually Works",
    description: "Expert AI consultant with 10,000+ hours experience. I build practical AI automation solutions that deliver real business results.",
    url: "https://farzadbayat.com",
  },
  alternates: {
    canonical: "https://farzadbayat.com",
  },
}

const features = [
  {
    icon: ClientBrain,
    title: "AI Strategy & Implementation",
    description: "Custom AI solutions designed for your specific business needs and workflows."
  },
  {
    icon: FbcIcon,
    title: "Intelligent Chatbots",
    description: "Advanced conversational AI that understands context and delivers real value."
  },
  {
    icon: ClientZap,
    title: "Workflow Automation",
    description: "Streamline repetitive tasks with smart automation that learns and adapts."
  },
  {
    icon: ClientTarget,
    title: "Rapid Prototyping",
    description: "Quick proof-of-concepts to validate AI solutions before full implementation."
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechStart",
    content: "Farzad's AI automation saved us 20 hours per week. The chatbot he built understands our customers better than we expected."
  },
  {
    name: "Michael Chen",
    role: "Operations Director",
    content: "The workflow automation Farzad implemented reduced our processing time by 60%. Incredible results."
  },
  {
    name: "Lisa Rodriguez",
    role: "Marketing Manager",
    content: "Working with Farzad was a game-changer. His AI solutions are practical and actually work in the real world."
  }
]

const stats = [
  { number: "10,000+", label: "Hours of AI Experience" },
  { number: "50+", label: "AI Projects Delivered" },
  { number: "95%", label: "Client Satisfaction Rate" },
  { number: "4+", label: "Years in AI Consulting" }
]

export default function HomePage() {
  return (
    <>
      {/* Enhanced Hero Section */}
      <PageShell className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,theme(colors.accent.DEFAULT),transparent_60%)] opacity-20 blur-3xl animate-[spin_20s_linear_infinite]" />
          <div className="absolute left-1/3 top-1/4 h-72 w-72 rounded-full bg-accent/10 blur-2xl animate-pulse [animation-delay:1s]" />
          <div className="absolute right-1/3 bottom-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl animate-pulse [animation-delay:2s]" />
        </div>

        <div className="text-center max-w-6xl mx-auto px-4 relative z-10">
          {/* Floating Icon with Enhanced Animation */}
          <FadeIn delay={0.1}>
            <div className="flex justify-center mb-12 relative">
              <div className="relative">
                <div className="absolute inset-0 -z-10">
                  <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30 animate-pulse" />
                  <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20 animate-pulse [animation-delay:0.5s]" />
                  <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10 animate-pulse [animation-delay:1s]" />
                </div>
                <FbcIconPolished className="w-24 h-24 relative z-10 transition-transform hover:scale-110 duration-500" />
              </div>
            </div>
          </FadeIn>

          {/* Enhanced Headline */}
          <FadeIn delay={0.2}>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 text-sm font-medium text-accent mb-6">
                <Zap className="h-4 w-4" />
                10,000+ Hours of AI Experience
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight">
                Build AI That
                <br />
                <span className="bg-gradient-to-r from-accent via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
                  Actually Works
                </span>
              </h1>
            </div>
          </FadeIn>

          {/* Enhanced Description */}
          <FadeIn delay={0.3}>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
              I'm Farzad Bayat, an AI consultant who builds 
              <span className="text-primary font-semibold"> practical automation solutions</span> that deliver 
              <span className="text-accent font-semibold"> real business results</span>—not just hype.
            </p>
          </FadeIn>

          {/* Stats Bar */}
          <FadeIn delay={0.4}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
              {stats.map((stat, i) => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                  <div className="text-2xl md:text-3xl font-bold text-accent mb-1">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Enhanced CTA Buttons */}
          <FadeIn delay={0.5}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <BookCallButton 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                title="Book Your Free AI Consultation"
              >
                Start Your AI Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </BookCallButton>
              <Button asChild variant="outline" size="lg" className="border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 px-8 py-4 text-lg">
                <Link href="/chat" className="flex items-center">
                  <FbcIcon className="mr-2 h-5 w-5" />
                  Try AI Demo
                </Link>
              </Button>
            </div>
          </FadeIn>

          {/* Trust Indicators */}
          <FadeIn delay={0.6}>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Free Consultation
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                95% Client Satisfaction
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Rapid Implementation
              </div>
            </div>
          </FadeIn>
        </div>
      </PageShell>


      {/* Enhanced Features Section */}
      <PageShell className="relative py-24">
        {/* Section Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent -z-10" />
        
        <div className="mb-6 flex justify-center">
          <ProgressTracker />
        </div>
        
        <FadeIn delay={0.1}>
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 text-sm font-medium text-accent mb-6">
              <Brain className="h-4 w-4" />
              Proven AI Solutions
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              AI That Delivers
              <span className="block text-accent">Real Results</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From intelligent chatbots to workflow automation, I build AI systems that solve real business problems and deliver measurable ROI.
            </p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={0.2 + i * 0.1}>
              <MotionCard className="group relative overflow-hidden border-0 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl hover:from-background/90 hover:to-background/60 transition-all duration-500">
                <CardContent className="p-8 text-center relative z-10">
                  {/* Icon with enhanced animation */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-accent/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 group-hover:scale-150" />
                    <feature.icon className="relative mx-auto h-16 w-16 text-accent transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-primary mb-4 group-hover:text-accent transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                </CardContent>
                
                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="h-full w-full rounded-2xl bg-background/80 backdrop-blur-xl" />
                </div>
              </MotionCard>
            </FadeIn>
          ))}
        </div>
        
        {/* Call to Action in Features Section */}
        <FadeIn delay={0.6}>
          <div className="text-center mt-16">
            <Button asChild size="lg" variant="outline" className="border-2 border-accent/30 hover:border-accent/60 hover:bg-accent/5">
              <Link href="/consulting">
                Explore All Solutions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </PageShell>

      {/* Enhanced Testimonials Section */}
      <PageShell className="relative py-24 bg-gradient-to-br from-secondary/30 to-secondary/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />
        
        <FadeIn delay={0.1}>
          <div className="text-center mb-20 relative z-10">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 mb-6">
              <Star className="h-4 w-4 fill-current" />
              95% Client Satisfaction
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              Trusted by
              <span className="block text-accent">Business Leaders</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Real results from real businesses using my AI automation solutions.
            </p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto relative z-10">
          {testimonials.map((testimonial, i) => (
            <FadeIn key={testimonial.name} delay={0.2 + i * 0.1}>
              <MotionCard className="group h-full border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl">
                <CardContent className="p-8 h-full flex flex-col">
                  {/* Star rating with animation */}
                  <div className="flex mb-6 gap-1">
                    {[...Array(5)].map((_, starIndex) => (
                      <Star 
                        key={starIndex} 
                        className="h-5 w-5 fill-accent text-accent transition-all duration-300 group-hover:scale-110"
                        style={{ animationDelay: `${starIndex * 0.1}s` }}
                      />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <blockquote className="text-lg text-foreground mb-6 flex-grow leading-relaxed font-medium">
                    "{testimonial.content}"
                  </blockquote>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-accent">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-primary text-lg">{testimonial.name}</div>
                      <div className="text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                </CardContent>
              </MotionCard>
            </FadeIn>
          ))}
        </div>

        {/* Trust indicators */}
        <FadeIn delay={0.6}>
          <div className="mt-20 text-center">
            <p className="text-muted-foreground mb-8">Trusted by businesses of all sizes</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-muted-foreground">TechStart</div>
              <div className="text-2xl font-bold text-muted-foreground">InnovateCorp</div>
              <div className="text-2xl font-bold text-muted-foreground">GrowthLab</div>
              <div className="text-2xl font-bold text-muted-foreground">ScaleUp</div>
            </div>
          </div>
        </FadeIn>
      </PageShell>

      {/* Citations Preview */}
      <PageShell>
        <CitationsDemo />
      </PageShell>

      {/* Why Choose Me Section */}
      <PageShell>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-6">
              Why Work With Me?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Practical Experience</h3>
                  <p className="text-muted-foreground">10,000+ hours building real AI solutions, not just theory.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Business-Focused</h3>
                  <p className="text-muted-foreground">I understand business needs and build AI that delivers ROI.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClientTarget className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary">Rapid Implementation</h3>
                  <p className="text-muted-foreground">Quick prototypes and fast deployment to get results sooner.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg p-8">
            <h3 className="text-xl font-bold text-primary mb-4">Ready to Transform Your Business?</h3>
            <p className="text-muted-foreground mb-6">
              Let's discuss how AI automation can streamline your workflows and boost productivity.
            </p>
            <BookCallButton className="w-full bg-accent hover:bg-accent/90" title="Schedule Free Consultation" />
          </div>
        </div>
      </PageShell>

      {/* Enhanced Services Section */}
      <PageShell className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/10 to-transparent" />
        
        <FadeIn delay={0.1}>
          <div className="text-center mb-20 relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary mb-6">
              <TrendingUp className="h-4 w-4" />
              End-to-End Solutions
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-6">
              How I Can
              <span className="block text-accent">Transform Your Business</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From strategy to implementation, I provide comprehensive AI solutions that drive real business value.
            </p>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-6xl mx-auto relative z-10">
          <FadeIn delay={0.2}>
            <MotionCard className="group h-full border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl">
              <CardContent className="p-10 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-2">AI Consulting & Strategy</h3>
                    <div className="text-accent font-semibold">Starting at $2,500</div>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed flex-grow">
                  Comprehensive AI assessment and strategic planning to identify the best opportunities for automation in your business. Get a clear roadmap for AI implementation.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">AI Readiness Assessment</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">Custom Implementation Roadmap</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">ROI Projections & Cost Analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">Technology Recommendations</span>
                  </div>
                </div>
                
                <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground group-hover:scale-105 transition-all duration-300">
                  <Link href="/consulting">
                    Start Consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </MotionCard>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <MotionCard className="group h-full border-0 bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl">
              <CardContent className="p-10 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-2">Hands-On AI Workshop</h3>
                    <div className="text-accent font-semibold">$497 per person</div>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed flex-grow">
                  Interactive workshop where you'll build your first AI automation tool and learn practical implementation strategies. Perfect for teams wanting hands-on experience.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">Build Your First AI Tool</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">Practical Implementation Guide</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">Team Training & Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">30-Day Follow-up Support</span>
                  </div>
                </div>
                
                <Button asChild variant="outline" className="border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 group-hover:scale-105 transition-all duration-300">
                  <Link href="/workshop">
                    Join Workshop
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </MotionCard>
          </FadeIn>
        </div>
        
        {/* Additional service highlight */}
        <FadeIn delay={0.4}>
          <div className="mt-16 text-center relative z-10">
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-2xl p-8 max-w-4xl mx-auto border border-accent/20">
              <h3 className="text-2xl font-bold text-primary mb-4">Custom AI Development</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Need something specific? I build custom AI solutions tailored to your exact business needs.
              </p>
              <Button asChild variant="outline" className="border-accent hover:bg-accent/10">
                <Link href="/contact">Discuss Your Project</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </PageShell>

      {/* Enhanced Final CTA Section */}
      <PageShell className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-primary/5 to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        
        <FadeIn delay={0.1}>
          <div className="relative z-10 text-center bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-xl rounded-3xl p-12 md:p-16 max-w-5xl mx-auto border border-accent/20 shadow-2xl">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 text-sm font-medium text-accent mb-8">
              <Zap className="h-4 w-4" />
              Ready to Transform?
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-6">
              Ready to Build AI That
              <span className="block bg-gradient-to-r from-accent via-accent to-primary bg-clip-text text-transparent">
                Actually Works?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Stop wasting time on AI solutions that don't deliver. Let's build something that actually moves your business forward.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <BookCallButton 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-6 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                title="Book Your Free AI Consultation"
              >
                Start Your Project Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </BookCallButton>
              <Button asChild variant="outline" size="lg" className="border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 px-10 py-6 text-xl">
                <Link href="/chat" className="flex items-center">
                  <FbcIcon className="mr-2 h-5 w-5" />
                  Try AI Demo
                </Link>
              </Button>
            </div>
            
            {/* Final trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Free consultation
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No long-term contracts
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Results guaranteed
              </div>
            </div>
            
            {/* Subtle background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10" />
          </div>
        </FadeIn>
      </PageShell>
    </>
  )
}
