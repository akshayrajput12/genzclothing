import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Increase delay to accommodate the full sequence
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 4500);

        // Disable scrolling while loading
        if (isLoading) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = "unset";
        };
    }, [isLoading]);

    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
                    initial={{ y: 0 }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                >
                    <div className="relative flex items-center justify-center px-6">
                        {/* Logo Container - Center of Screen */}
                        <motion.div
                            className="flex items-center"
                            initial={{ x: "-50vw", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 1, ease: "circOut" }}
                        >
                            <div className="relative flex items-center gap-2 md:gap-3">
                                {/* Logo Icon */}
                                <motion.div
                                    className="w-12 h-12 md:w-16 md:h-16 bg-[#1a0e0e] flex items-center justify-center relative z-20 overflow-hidden rounded-full flex-shrink-0 border border-primary/20"
                                    animate={{
                                        scale: [1, 3.5, 3.5, 1],
                                        y: [0, 0, 0, 0],
                                        x: [0, 0, 0, 0],
                                    }}
                                    exit={{
                                        x: 100,
                                        opacity: 0,
                                    }}
                                    transition={{
                                        times: [0, 0.4, 0.6, 1],
                                        duration: 2.5,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <img
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNCfEWhMrKQwQ7gZdXHsUVAM5_EH5kfZcHM_9GU8QxEoqGgG3lRldZ6kqTLNzxWF_FFWgbvpC83g_RWRFu7KD3LW5qOcXRzt5CdD8Fp_cBDVYrD91Je-FbCF1xkOmgv762E0AODAUmf28xgLHVylGKD-Nj-5o-kDamwr39-9FMg3FZ2p5Oid_hWdjG0JaJwQXWQaVdGGHn2LyrOTSBqjBDq8kVPTo2SflADS_6G4G15TofTRehu2ZZXFJ8b9iHQE8XgiGCVpk77CqJ"
                                        alt="Obito Logo"
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                </motion.div>

                                {/* Text Container */}
                                <motion.div
                                    className="overflow-hidden flex flex-col justify-center"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "auto", opacity: 1 }}
                                    exit={{ x: 100, opacity: 0 }}
                                    transition={{
                                        delay: 2.5, // Matches end of logo movement
                                        duration: 0.8,
                                        ease: "easeOut",
                                    }}
                                >
                                    <div className="whitespace-nowrap pl-3">
                                        <motion.h1
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 2.6, duration: 0.5 }}
                                            className="font-bold text-white uppercase tracking-tighter flex items-start"
                                        >
                                            <span className="text-[2rem] md:text-[3rem] font-display leading-none mt-1 md:mt-1 text-white">
                                                OBITO
                                            </span>
                                        </motion.h1>
                                        <motion.p
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 2.7, duration: 0.5 }}
                                            className="text-[8px] md:text-[10px] text-primary tracking-[0.4em] uppercase font-mono"
                                        >
                                            Streetwear Redefined
                                        </motion.p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
