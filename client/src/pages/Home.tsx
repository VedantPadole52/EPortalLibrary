
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, ArrowRight, Library, GraduationCap, History } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { getTranslation } from "@/lib/translations";
import heroBg from "@assets/generated_images/modern_digital_library_interior_with_students.png";
import book1 from "@assets/generated_images/history_book_cover.png";
import book2 from "@assets/generated_images/mathematics_book_cover.png";
import book3 from "@assets/generated_images/science_book_cover.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const t = (key: any) => getTranslation(language, key);

  const handleNcertClick = () => {
    setLocation("/login");
  };

  const handleCompetitiveExamsClick = () => {
    setLocation("/login");
  };

  const handleHistoricalArchivesClick = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30 font-sans">
      <Header variant="public" />

      {/* Hero Section */}
      <section className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium mb-6 uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
            Official Digital E-Library Portal
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto drop-shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            {t('knowledge')} <br/>
            <span className="text-yellow-400">{t('amravatiDigitalFuture')}</span>
          </h1>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            {t('accessThousands')}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-full p-2 flex items-center shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <Search className="ml-4 text-muted-foreground h-5 w-5" />
            <Input 
              className="border-none shadow-none focus-visible:ring-0 text-lg bg-transparent flex-1 px-4" 
              placeholder={t('searchBooks')} 
            />
            <Button size="lg" className="rounded-full px-8 bg-accent hover:bg-accent/90 text-white">
              {t('search')}
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center border-b-4 border-accent inline-block mx-auto pb-2 px-4">
            {t('exploreCollections')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category 1 */}
            <button 
              onClick={handleHistoricalArchivesClick}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-border text-left"
              data-testid="button-historical-archives"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <img src={book1} alt="History" className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 p-6 z-20 text-white">
                <History className="h-8 w-8 mb-2 text-yellow-400" />
                <h3 className="text-xl font-bold mb-1">{t('historicalArchives')}</h3>
                <p className="text-sm text-white/80">{t('historicalArchivesDesc')}</p>
              </div>
            </button>

            {/* Category 2 */}
            <button 
              onClick={handleCompetitiveExamsClick}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-border text-left"
              data-testid="button-competitive-exams"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <img src={book2} alt="Math" className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 p-6 z-20 text-white">
                <GraduationCap className="h-8 w-8 mb-2 text-accent" />
                <h3 className="text-xl font-bold mb-1">{t('competitiveExams')}</h3>
                <p className="text-sm text-white/80">{t('competitiveExamsDesc')}</p>
              </div>
            </button>

            {/* Category 3 */}
            <button 
              onClick={handleNcertClick}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-border text-left"
              data-testid="button-ncert-textbooks"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <img src={book3} alt="Science" className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 p-6 z-20 text-white">
                <BookOpen className="h-8 w-8 mb-2 text-blue-400" />
                <h3 className="text-xl font-bold mb-1">{t('ncertTextbooks')}</h3>
                <p className="text-sm text-white/80">{t('ncertTextbooksDesc')}</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-primary rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">{t('startJourney')}</h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                {t('createAccount')}
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold px-8">
                  {t('registerCitizen')} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
