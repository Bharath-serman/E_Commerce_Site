'use client';

import { useEffect, useState } from 'react';

interface SaleBannerProps {
  sale: {
    title: string;
    description: string;
    bannerText: string;
    discountType: string;
    discountValue: number;
    endDate: string;
    backgroundColor: string;
    textColor: string;
    bannerImage?: string;
    showCountdown: boolean;
  };
}

export default function SaleBanner({ sale }: SaleBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(sale.endDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [sale.endDate]);

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isExpired) {
    return null;
  }

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: sale.backgroundColor }}
    >
      {sale.bannerImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${sale.bannerImage})` }}
        />
      )}
      
      <div className="relative px-4 py-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2" style={{ color: sale.textColor }}>
            {sale.bannerText}
          </h2>
          <p className="text-sm md:text-base mb-4 opacity-90" style={{ color: sale.textColor }}>
            {sale.description}
          </p>
          
          {sale.showCountdown && (
            <div className="flex justify-center items-center gap-2 md:gap-4 mb-4">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Mins' },
                { value: timeLeft.seconds, label: 'Secs' }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center font-bold text-lg md:text-xl border-2"
                    style={{ 
                      color: sale.textColor,
                      borderColor: sale.textColor,
                      backgroundColor: `${sale.textColor}20`
                    }}
                  >
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <span 
                    className="text-xs mt-1 font-medium uppercase tracking-wider"
                    style={{ color: sale.textColor }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-center gap-4">
            <a 
              href="#collection" 
              className="inline-block px-6 py-2 text-sm font-bold uppercase tracking-widest rounded-sm transition-all hover:scale-105"
              style={{ 
                color: sale.backgroundColor,
                backgroundColor: sale.textColor,
                border: `2px solid ${sale.textColor}`
              }}
            >
              Shop Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
