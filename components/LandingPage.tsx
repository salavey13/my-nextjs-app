import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ChevronRight, Code, Menu, Palette, X, Zap, Globe, Lock, Users } from "lucide-react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"
import { useAppContext } from '../context/AppContext'
import useTelegram from '@/hooks/useTelegram'
import AutomationPipeline from '@/components/AutomationPipeline'
import { useInView } from '@/hooks/useInView';

const socialLinks = [
  { name: "YouTube", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", url: "https://youtube.com/salavey13" },
  { name: "Twitter", icon: "M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.87 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148a13.98 13.98 0 0 0 10.15 5.144 4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z", url: "https://twitter.com/salavey13" },
  { name: "GitHub", icon: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12", url: "https://github.com/salavey13" },
  { name: "LinkedIn", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", url: "https://linkedin.com/in/salavey13" },
  { name: "Instagram", icon: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z", url: "https://instagram.com/salavey13" },
  { name: "Facebook", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z", url: "https://facebook.com/pavel.solovyev" },
  { name: "Patreon", icon: "M0 .48v23.04h4.22V.48zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.623 8.641 8.623 4.75 0 8.615-3.868 8.615-8.623C24 4.36 20.136.48 15.385.48z", url: "https://patreon.com/salavey13" },
  { name: "Contra", icon: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.95 16.95l-3.536 3.536a2 2 0 0 1-2.828 0L7.05 16.95a2 2 0 0 1 0-2.828l3.536-3.536a2 2 0 0 1 2.828 0l3.536 3.536a2 2 0 0 1 0 2.828z", url: "https://contra.com/salavey13" },
  { name: "Telegram", icon: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82  1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z", url: "https://t.me/salavey13" },
]

export default function LandingPage() {
  const { t } = useAppContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const lastScrollY = useRef(0)
  const { scrollY } =    useScroll()
  const { openLink } = useTelegram()
  const { ref, isInView } = useInView(); // Hook to detect when in view
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    if (isInView && !animationStarted) {
      const timeout = setTimeout(() => {
        setAnimationStarted(true); // Start animation after a delay
      }, 500); // 500ms delay (adjust as needed)

      return () => clearTimeout(timeout);
    }
  }, [isInView, animationStarted]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section")
      const scrollPosition = window.scrollY

      sections.forEach((section) => {
        if (
          scrollPosition >= section.offsetTop - 100 &&
          scrollPosition < section.offsetTop + section.offsetHeight - 100
        ) {
          setActiveSection(section.id)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > lastScrollY.current && latest > 100) {
      setIsNavbarVisible(false)
    } else {
      setIsNavbarVisible(true)
    }
    lastScrollY.current = latest
  })

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      const yOffset = -128 // Adjust this value based on your navbar height
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  const sendTelegramNotification = async () => {
    const botToken = process.env.BOT_TOKEN;
    const chatId = "413553377";
    const message = "Someone clicked the 'Play Game' button!";
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to send Telegram notification');
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  };

  const handlePlayGame = useCallback(async () => {
    openLink("https://t.me/oneSitePlsBot/vip?ref=salavey13");
    await sendTelegramNotification();
    toast({
      title: t('gameOpenedTitle'),
      description: t('gameOpenedDescription'),
    });
  }, [t, openLink]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <motion.header 
        className="fixed top-16 left-0 right-0 bg-gray-900 shadow-md z-50"
        initial={{ y: 0 }}
        animate={{ y: isNavbarVisible ? 0 : -80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <nav className="container  mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#e1ff01]">{t('header.title')}</h1>
          <div className="md:hidden">
            <Button variant="neon" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
          <div className="hidden md:flex space-x-4">
            {["home", "features", "pricing", "templates", "instructions", "automation", "mobile-shop", "faq", "contact"].map((item) => (
              <Button
                key={item}
                variant="neon"
                className={activeSection === item ? "text-[#e1ff01]" : ""}
                onClick={() => scrollToSection(item)}
              >
                {t(`nav.${item}`)}
              </Button>
            ))}
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 64 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 bg-gray-900 shadow-md z-40 md:hidden"
          >
            {["home", "features", "pricing", "templates", "instructions", "automation", "mobile-shop", "faq", "contact"].map((item) => (
              <Button
                key={item}
                variant="secondary"
                className="w-full text-left py-3 px-4"
                onClick={() => scrollToSection(item)}
              >
                {t(`nav.${item}`)}
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 pt-20 pb-12">
        <section id="home" className="text-center mb-16 pt-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-[#e1ff01] mb-4"
          >
            {t("home.heading")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            {t('home.description')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 relative"
          >
            <Image
              src="/vercel.svg"
              alt={t('home.imageAlt')}
              width={69}
              height={69}
              className="rounded-lg mx-auto drop-shadow-custom invert"
            />
            <Image
              src="/next.svg"
              alt="Next.js Logo"
              width={100}
              height={100}
              className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-custom  invert"
            />
            <Image
              src="/reactb.svg"
              alt="React Logo"
              width={80}
              height={80}
              className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 drop-shadow-custom  invert"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Button
              onClick={() => openLink("https://youtube.com/salavey13")}
              className="bg-[#e1ff01] px-6 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              {t('home.watchVideos')} <ChevronRight className="inline-block ml-2" />
            </Button>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">{t('features.heading')}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-[#e1ff01]" />, title: t('features.aiPowered'), description: t('features.aiPoweredDesc') },
              { icon: <Code className="text-[#e1ff01]" />, title: t('features.effortlessCreation'), description: t('features.effortlessCreationDesc') },
              { icon: <Palette className="text-[#e1ff01]" />, title: t('features.customizableTemplates'), description: t('features.customizableTemplatesDesc') },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * (index + 1) }}
              >
                <Card className="bg-gray-900 border-gray-800 hover:border-[#e1ff01] transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#e1ff01]">
                      {feature.icon}
                      <span className="ml-2">{feature.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300">{feature.description}</CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="text-center mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8">{t('pricing.heading')}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: t('pricing.basic'), price: "$13", link: "https://oneSitePls.framer.ai/shop/3993889", features: [t('pricing.feature1'), t('pricing.feature2'), t('pricing.feature3')] },
              { title: t('pricing.pro'), price: "$69", link: "https://oneSitePls.framer.ai/shop/3994713", features: [t('pricing.proFeature1'), t('pricing.proFeature2'), t('pricing.proFeature3'), t('pricing.proFeature4')] },
              { title: t('pricing.enterprise'), price: "$420", link: "https://oneSitePls.framer.ai/shop/3994855", features: [t('pricing.enterpriseFeature1'), t('pricing.enterpriseFeature2'), t('pricing.enterpriseFeature3'), t('pricing.enterpriseFeature4')] },
            ].map((plan, index) => (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * (index + 1) }}
              >
                <Card className="bg-gray-900 border-gray-800 hover:border-[#e1ff01] transition-colors">
                  <CardHeader>
                    <CardTitle className="text-[#e1ff01]">{plan.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-4 text-gray-100">{plan.price}</p>
                    <ul className="text-left mb-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="mb-2 text-gray-300">✓ {feature}</li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => openLink(plan.link)}
                      className="w-full bg-[#e1ff01] hover:bg-opacity-90 transition-colors"
                    >
                      {t('pricing.choosePlan')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Templates Section */}
        <section id="templates" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">{t('templates.heading')}</h3>
          <p className="text-center mb-8 text-gray-300">
            {t('templates.description')}
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: t('templates.unhuilome'), description: t('templates.unhuilomeDesc'), link: "https://oneSitePls.framer.ai/shop/unhuilome" },
              { title: t('templates.ezShop'), description: t('templates.ezShopDesc'), link: "https://oneSitePls.framer.ai/shop/ezshop" },
              { title: t('templates.promo'), description: t('templates.promoDesc'), link: "https://oneSitePls.framer.ai/shop/promo" },
              { title: t('templates.domiki'), description: t('templates.domikiDesc'), link: "https://oneSitePls.framer.ai/shop/domiki" },
            ].map((template, index) => (
              <motion.div
                key={template.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * (index + 1) }}
              >
                <Card className="bg-gray-900 border-gray-800 hover:border-[#e1ff01] transition-colors">
                  <CardHeader>
                    <CardTitle className="text-[#e1ff01]">{template.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{template.description}</p>
                    <Button
                      onClick={() => openLink(template.link)}
                      className="bg-[#e1ff01] hover:bg-opacity-90 transition-colors"
                    >
                      {t('templates.viewTemplate')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Instructions Section */}
        <section id="instructions" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">{t('instructions.heading')}</h3>
          <p className="text-center mb-8 text-gray-300">
            {t('instructions.description')}
          </p>
          <div className="text-center">
            <Button
              onClick={() => openLink("https://oneSitePls.framer.ai/instructions")}
              className="bg-[#e1ff01] px-6 py-3  rounded-lg text-lg hover:bg-opacity-90 transition-colors"
            >
              {t('instructions.viewInstructions')} <ChevronRight className="ml-2" />
            </Button>
          </div>
        </section>

        {/* Automation Pipeline Section */}
        <section id="automation" ref={ref} className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">
            {t('automation.heading')}
          </h3>
          <p className="text-center mb-8 text-gray-300">
            {t('automation.description')}
          </p>
          {/* Conditionally render or start AutomationPipeline when animation starts */}
          {animationStarted && <AutomationPipeline />}
        </section>

        {/* Mobile Shop Section */}
        <section id="mobile-shop" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">{t('mobileShop.heading')}</h3>
          <div className="flex justify-center">
            <iframe
              src="https://oneSitePls.framer.ai/web13-2"
              title={t('mobileShop.title')}
              className="w-full max-w-sm h-[600px] border-0 rounded-lg shadow-lg"
            ></iframe>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">{t('faq.heading')}</h3>
          <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
            {[
              { 
                question: t('faq.whatIsV0'), 
                answer: t('faq.whatIsV0Answer')
              },
              { 
                question: t('faq.howDoesAIWork'), 
                answer: t('faq.howDoesAIWorkAnswer')
              },
              { 
                question: t('faq.customDomain'), 
                answer: t('faq.customDomainAnswer')
              },
              { 
                question: t('faq.freeTrial'), 
                answer: t('faq.freeTrialAnswer')
              },
              { 
                question: t('faq.isProgrammingObsolete'), 
                answer: t('faq.isProgrammingObsoleteAnswer')
              },
              { 
                question: t('faq.programmingTeachesThinking'), 
                answer: t('faq.programmingTeachesThinkingAnswer')
              },
              { 
                question: t('faq.programmingWithNewTools'), 
                answer: t('faq.programmingWithNewToolsAnswer')
              },
            ].map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-700">
                <AccordionTrigger className="text-gray-100 hover:text-[#000000] py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 pb-4 bg-gray-800 rounded-b-lg p-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Contact Section */}
        <section id="contact" className="text-center mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8">{t('contact.title')}</h3>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            {t('contact.description')}
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Button size="lg" className="bg-[#e1ff01]  rounded-lg text-lg hover:bg-opacity-90 transition-colors" onClick={handlePlayGame}>
              {t('contact.playGameButton')} <ChevronRight className="ml-2" />
            </Button>
          </div>
        </section>
        <section id="gigs" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">{t('gigs.title')}</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((index) => (
              <Card key={index} className="bg-gray-900 border-gray-800 hover:border-[#e1ff01] transition-colors">
                <CardHeader>
                  <CardTitle className="text-[#e1ff01]">{t(`gigs.service${index}Title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-gray-300">{t(`gigs.service${index}Description`)}</p>
                  <p className="text-2xl font-bold mb-4 text-gray-100">{t(`gigs.service${index}Price`)}</p>
                  <Button
                    onClick={() => openLink(t(`gigs.service${index}Link`))}
                    className="bg-[#e1ff01]  hover:bg-opacity-90"
                  >
                    {t(`gigs.service${index}LinkText`)}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="benefits" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">{t('benefits.title')}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Globe className="text-[#e1ff01] w-8 h-8" />, title: t('benefits.benefit1Title'), description: t('benefits.benefit1Description') },
              { icon: <Lock className="text-[#e1ff01] w-8 h-8" />, title: t('benefits.benefit2Title'), description: t('benefits.benefit2Description') },
              { icon: <Users className="text-[#e1ff01] w-8 h-8" />, title: t('benefits.benefit3Title'), description: t('benefits.benefit3Description') },
            ].map((benefit, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800 hover:border-[#e1ff01] transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#e1ff01]">
                    {benefit.icon}
                    <span className="ml-2">{benefit.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-300">{benefit.description}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-[#e1ff01]">{t('footer.aboutTitle')}</h4>
              <p>{t('footer.aboutDescription')}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-[#e1ff01]">{t('footer.quickLinksTitle')}</h4>
              <ul className="space-y-2">
                {["home", "features", "pricing", "templates", "instructions", "automation", "mobile-shop", "faq", "contact"].map((item, index) => (
                  <li key={item}>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-gray-300 hover:text-[#e1ff01] transition-colors"
                      onClick={() => scrollToSection(item)}
                    >
                      {t(`footer.quickLink${index + 1}`)}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 overflow-visible">
            <div className="flex animate-ticker justify-around w-[200%]">
              {[...socialLinks,...socialLinks].map((link, index) => (
                <Link href={link.url} key={`${link.name}-${index}`} passHref>
                                                    
      <div className="text-gray-400 hover:text-[#e1ff01] transition-colors mx-4 drop-shadow-custom flex items-center">
        {/* SVG icon - larger on mobile (3x), scales down for larger screens */}
        <svg
          className="h-12 w-12 md:h-6 md:w-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d={link.icon} />
        </svg>
        
        {/* Optionally, you can add the text for larger screens if needed */}
        <span className="hidden md:block ml-2">{link.name}</span> {/* Visible only on larger screens */}
      </div>
    </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 text-center flex flex-col gap-4">
            <p>{t('footer.copyright')}</p>
            
            <Button
              onClick={() => openLink("https://t.me/salavey13")}
              className="text-[#e1ff01] hover:underline  rounded-lg text-lg"
            >
              {t('contact.contactUs')}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}