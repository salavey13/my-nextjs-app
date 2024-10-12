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
import { useAppContext } from '../context/AppContext';

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
  const { scrollY } = useScroll()

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
      const yOffset = -80 // Adjust this value based on your navbar height
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
    setIsMenuOpen(false)
    setIsNavbarVisible(false)
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
    
    await sendTelegramNotification();
    toast({
      title: "Game is up there ↑",
      description: "The game is on!",
    });
  }, []);

return (
  <div className="min-h-screen bg-gray-950 text-gray-100">
    <motion.header 
      className="fixed top-16 left-0 right-0 bg-gray-900 shadow-md z-50"
      initial={{ y: 0 }}
      animate={{ y: isNavbarVisible ? 0 : -80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#e1ff01]">{t('header.title')}</h1>
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        <div className="hidden md:flex space-x-4">
          {["home", "features", "pricing", "templates", "instructions", "mobile-shop", "faq", "contact"].map((item) => (
            <Button
              key={item}
              variant="ghost"
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
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-16 left-0 right-0 bg-gray-900 shadow-md z-40 md:hidden"
        >
          {["home", "features", "pricing", "templates", "instructions", "mobile-shop", "faq", "contact"].map((item) => (
            <Button
              key={item}
              variant="ghost"
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
          {t('home.heading')}
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
          className="mt-8"
        >
          <Image
            src="/vercel.svg"
            alt={t('home.imageAlt')}
            width={420}
            height={420}
            className="rounded-lg shadow-lg mx-auto"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <a
            href="https://youtube.com/salavey13"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#e1ff01] text-black px-6 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            {t('home.watchVideos')} <ChevronRight className="inline-block ml-2" />
          </a>
        </motion.div>
      </section>

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




        <section id="pricing" className="text-center mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8">Pricing Plans</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "BASIC", price: "$13", link: "https://oneSitePls.framer.ai/shop/3993889", features: ["AI-powered design", "Responsive layout", "Basic SEO optimization"] },
              { title: "PRO", price: "$69", link: "https://oneSitePls.framer.ai/shop/3994713", features: ["All BASIC features", "Advanced customization", "Priority support", "Performance analytics"] },
              { title: "ENTERPRISE", price: "$420", link: "https://oneSitePls.framer.ai/shop/3994855", features: ["All PRO features", "Unlimited pages", "Custom integrations", "Dedicated account manager"] },
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
                    <a href={plan.link} target="_blank" rel="noopener noreferrer" className="inline-block w-full bg-[#e1ff01] text-black px-4 py-2 rounded hover:bg-opacity-90 transition-colors">Choose Plan</a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="templates" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">Explore v0 Templates</h3>
          <p className="text-center mb-8 text-gray-300">
            Unleash your creativity with our extensive collection of AI-generated templates, meticulously crafted to cater to diverse tastes and requirements.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "UnHuilome", description: "Versatile template for various projects", link: "https://oneSitePls.framer.ai/shop/unhuilome" },
              { title: "EZ Shop", description: "Quick and easy e-commerce solution", link: "https://oneSitePls.framer.ai/shop/ezshop" },
              { title: "Promo", description: "Promotional landing page template", link: "https://oneSitePls.framer.ai/shop/promo" },
              { title: "Domiki", description: "Real estate and property showcase", link: "https://oneSitePls.framer.ai/shop/domiki" },
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
                    <a href={template.link} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#e1ff01] text-gray-900 px-4 py-2 rounded hover:bg-opacity-90 transition-colors">View Template</a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="instructions" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">How to Get Started</h3>
          <p className="text-center mb-8 text-gray-300">
            Follow our step-by-step instructions to create your perfect website with v0.
          </p>
          <div className="text-center">
            <a
              href="https://oneSitePls.framer.ai/instructions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#e1ff01] text-gray-900 px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              View Instructions
            </a>
          </div>
        </section>

        <section id="mobile-shop" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">Mobile Template Shop</h3>
          <div className="flex justify-center">
            <iframe
              src="https://oneSitePls.framer.ai/web13-2"
              title="Mobile Template Shop"
              className="w-full max-w-sm h-[600px] border-0 rounded-lg shadow-lg"
            ></iframe>
          </div>
        </section>

        <section id="faq" className="mb-16">
  <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">Frequently Asked Questions</h3>
  <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
    {[
      { 
        question: "What is v0?", 
        answer: "v0 is an advanced AI-powered web development platform that allows you to create stunning websites without coding expertise. In other words, it’s here to do the heavy lifting while you kick back and enjoy the ride."
      },
      { 
        question: "How does the AI work?", 
        answer: "Our AI analyzes your requirements and preferences to generate custom designs and layouts. So yes, it does the thinking for you. If you were worried about using your brain—no stress, we’ve got it covered."
      },
      { 
        question: "Can I use my own domain?", 
        answer: "Of course! Because nothing screams professionalism like your own custom domain, and v0 makes that connection a breeze."
      },
      { 
        question: "Is there a free trial available?", 
        answer: "Yes, we offer a complimentary trial with all the essentials so you can see just how much easier life can be when you let AI do the hard stuff."
      },
      { 
        question: "Is programming becoming obsolete because of AI?", 
        answer: "Oh, definitely. AI is going to handle everything. Who needs human programmers anymore, right? Just sit back and let the machines do the job (sarcasm intended)."
      },
      { 
        question: "But some people say learning to program teaches you how to think. Is that true?", 
        answer: "Think? Pffft. Thinking is overrated. Let v0 and AI handle the brainwork. You just focus on staying fabulous."
      },
      { 
        question: "I heard that programming can be fun with new tools like Cursor. Should I consider that?", 
        answer: "Fun? Programming? Surely, you're joking. If you enjoy frustration and pulling your hair out, then absolutely—go ahead!"
      },
      { 
        question: "Aren’t there a lot of problems in the world that could be solved with AI and programming?", 
        answer: "Problems? What problems? Ignorance is bliss, my friend. Leave the hard thinking and problem-solving to AI and programmers."
      },
      { 
        question: "I’m worried about all the competition in the programming field. Should I avoid learning to code?", 
        answer: "Yes, absolutely avoid it. We current coders need less competition. So, do us a favor and stay far away from learning programming (wink)."
      }
    ].map((item, index) => (
      <AccordionItem key={index} value={`item-${index}`}>
        <AccordionTrigger className="text-black">{item.question}</AccordionTrigger>
        <AccordionContent className="text-gray-300">{item.answer}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
</section>


        <section id="contact" className="text-center mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8">Get Started Today!</h3>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Experience the future of web development with v0. Let our AI bring your vision to life effortlessly.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <Button size="lg" className="bg-[#e1ff01] text-gray-900 hover:bg-opacity-90" onClick={handlePlayGame}>
              Play Game <ChevronRight className="ml-2" />
            </Button>
            <a
              href="https://t.me/salavey13"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e1ff01] hover:underline"
            >
              Contact us on Telegram
            </a>
          </div>
        </section>

        <section id="gigs" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">Our Services on Contra</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Move existing web site to v0",
                description: "Let us seamlessly transition your existing website to the v0 platform.",
                price: "$69.13",
                link: "https://contra.com/s/lXMUXEXe-move-existing-web-site-to-framer"
              },
              {
                title: "Create custom v0 projects",
                description: "Custom website creation tailored to your specific needs using v0's AI capabilities.",
                price: "$69.13",
                link: "https://contra.com/s/RggeLso3-create-landing-paywall-membership-e-market-sites-and-more"
              }
            ].map((gig, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800 hover:border-[#e1ff01] transition-colors">
                <CardHeader>
                  <CardTitle className="text-[#e1ff01]">{gig.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-gray-300">{gig.description}</p>
                  <p className="text-2xl font-bold mb-4 text-gray-100">{gig.price}</p>
                  <a
                    href={gig.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#e1ff01] text-black px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
                  >
                    Hire on Contra
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="benefits" className="mb-16">
          <h3 className="text-3xl font-bold text-[#e1ff01] mb-8 text-center">Why Choose v0?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Globe className="text-[#e1ff01] w-8 h-8" />, title: "Global Accessibility", description: "Create websites that are accessible and performant worldwide." },
              { icon: <Lock className="text-[#e1ff01] w-8 h-8" />, title: "Security First", description: "Built-in security features to keep your website and data safe." },
              { icon: <Users className="text-[#e1ff01] w-8 h-8" />, title: "Collaborative Tools", description: "Seamlessly work with your team on web projects." },
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
              <h4 className="text-lg font-semibold mb-4 text-[#e1ff01]">About v0</h4>
              <p>Empowering developers and businesses with AI-enhanced tools for effortless web creation.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-[#e1ff01]">Quick Links</h4>
              <ul className="space-y-2">
                {["Home", "Features", "Pricing", "Templates", "Instructions", "Mobile Shop", "FAQ", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="hover:text-[#e1ff01] transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        scrollToSection(item.toLowerCase())
                      }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 overflow-hidden">
            <div className="flex animate-ticker">
              {[...socialLinks, ...socialLinks].map((link, index) => (
                <a
                  key={`${link.name}-${index}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#e1ff01] transition-colors mx-4"
                >
                  <span className="sr-only">{link.name}</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={link.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2024 v0 AI Dev.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
