import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080",
    title: "Join the Ultimate Running Experience",
    subtitle: "Discover marathons worldwide and push your limits",
    buttons: [
      { text: "Explore Marathons", href: "/marathons", variant: "default" },
      { text: "Create Event", href: "/add-marathon", variant: "outline" }
    ]
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080",
    title: "Trail Running Adventures",
    subtitle: "Experience nature while challenging yourself",
    buttons: [
      { text: "View Trail Events", href: "/marathons", variant: "default" }
    ]
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080",
    title: "Achieve Your Goals",
    subtitle: "Cross the finish line and celebrate your victory",
    buttons: [
      { text: "Start Your Journey", href: "/register", variant: "default" }
    ]
  }
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative bg-slate-900 overflow-hidden">
      <div className="relative h-96 md:h-[500px] lg:h-[600px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90">{slide.subtitle}</p>
                <div className="space-x-4">
                  {slide.buttons.map((button, btnIndex) => (
                    <Link key={btnIndex} to={button.href}>
                      <Button
                        className={button.variant === 'outline' 
                          ? "border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3 rounded-lg text-lg font-semibold transition-colors bg-transparent"
                          : "bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                        }
                      >
                        {button.text}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white bg-opacity-100' : 'bg-white bg-opacity-50'
              } hover:bg-opacity-100`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
