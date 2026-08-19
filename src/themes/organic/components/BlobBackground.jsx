import { motion } from "framer-motion";


const BLOBS = [
  {
    color: "rgba(102, 126, 234, 0.4)",
    size: 400,
    delay: 0,
    duration: 20,
    top: "12%",
    left: "18%",
  },
  {
    color: "rgba(247, 107, 182, 0.4)",
    size: 350,
    delay: 2,
    duration: 25,
    top: "58%",
    left: "68%",
  },
  {
    color: "rgba(79, 172, 254, 0.4)",
    size: 450,
    delay: 4,
    duration: 22,
    top: "32%",
    left: "42%",
  },
];

const BlobBackground = () => (
  <div className="organic-background">
    {BLOBS.map((blob) => (
      <motion.div
        key={blob.color}
        className="organic-blob"
        style={{
          position: "absolute",
          width: blob.size,
          height: blob.size,
          borderRadius: "50%",
          background: blob.color,
          top: blob.top,
          left: blob.left,
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: blob.duration,
          delay: blob.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

export default BlobBackground;
