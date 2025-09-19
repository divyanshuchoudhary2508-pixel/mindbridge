import { motion } from "framer-motion";

interface CalmBackgroundProps {
  children: React.ReactNode;
  showVideo?: boolean;
  videoSrc?: string;
  posterSrc?: string;
}

export default function CalmBackground({ 
  children, 
  showVideo = false, 
  videoSrc,
  posterSrc 
}: CalmBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      {showVideo && videoSrc ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
          className="absolute inset-0 w-full h-full object-cover ken-burns"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : posterSrc ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center ken-burns"
          style={{ backgroundImage: `url(${posterSrc})` }}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-background via-card to-muted" />
      )}

      {/* Animated leaves */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/20"
            initial={{
              x: -100,
              y: Math.random() * window.innerHeight,
              rotate: 0,
            }}
            animate={{
              x: window.innerWidth + 100,
              y: Math.random() * window.innerHeight,
              rotate: 360,
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            style={{
              fontSize: `${20 + Math.random() * 20}px`,
            }}
          >
            🍃
          </motion.div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
