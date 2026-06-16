import { useEffect, useRef, useState } from 'react';

interface StatCounterProps {
  icon: string;
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export function StatCounter({ icon, target, prefix = '', suffix = '', label }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-4">
      <span className="text-3xl mb-1">{icon}</span>
      <span className="text-3xl sm:text-4xl font-black text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
        {prefix}{count.toLocaleString('fr-FR')}{suffix}
      </span>
      <span className="text-sm text-white/80 text-center font-medium">{label}</span>
    </div>
  );
}
