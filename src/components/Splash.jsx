import { motion } from "framer-motion";

export default function Splash({ onFinish }) {
    return (
        <motion.div
           className="fixed inset-0 bg-[#1f1f1f] flex items-center justify-center z-50"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            onAnimationComplete={onFinish} 
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-6xl md:text-7xl font-bold text-[#d4af37]"
                style={{ fontFamily: "Space Grotesk", letterSpacing: "0.08em" }}
            >
                STREAK
            </motion.div>
        </motion.div>
    );
}