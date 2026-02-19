// src/pages/LandingPage.tsx
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { CoursesSection } from '@/components/landing/CoursesSection';
import { MethodologySection } from '@/components/landing/MethodologySection';
import { ClientsSection } from '@/components/landing/ClientsSection';
import { NewsSection } from '@/components/landing/NewsSection';
import { useLandingContent } from '@/hooks/useLandingContent';

export function LandingPage() {
  const { content } = useLandingContent();

  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main>
        <HeroSection content={content.hero} />
        <AboutSection content={content.nosotros} />
        <CoursesSection content={content.cursos} />
        <MethodologySection content={content.metodologia} />
        <ClientsSection content={content.clientes} />
        <NewsSection content={content.noticias} />
      </main>
      <LandingFooter content={content.footer} />
    </div>
  );
}