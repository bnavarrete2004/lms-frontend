// src/pages/LandingPage.tsx
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { CoursesSection } from '@/components/landing/CoursesSection';
import { MethodologySection } from '@/components/landing/MethodologySection';
import { ClientsSection } from '@/components/landing/ClientsSection';
import { NewsSection } from '@/components/landing/NewsSection';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main>
        <HeroSection />
        <AboutSection />
        <CoursesSection />
        <MethodologySection />
        <ClientsSection />
        <NewsSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}