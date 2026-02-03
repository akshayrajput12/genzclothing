import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/settingsHelpers';
import { useSettings } from '@/hooks/useSettings';

const ShinobiToast = () => {
    const { notification, closeNotification, toggleCart } = useStore();
    const { isOpen, item } = notification;
    const { settings } = useSettings();

    // Auto close after 5 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                closeNotification();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, closeNotification]);

    const handleViewCart = () => {
        closeNotification();
        toggleCart();
    };

    return (
        <AnimatePresence>
            {isOpen && item && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed top-24 right-4 md:right-8 z-50 w-full max-w-sm"
                >
                    <div className="relative bg-[#F8FAFC] dark:bg-[#0B0B0F] border-l-4 border-primary shadow-2xl rounded-lg overflow-hidden p-4 flex gap-4 grain-texture">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-primary/10 rounded-full blur-xl"></div>

                        {/* Image */}
                        <div className="relative flex-shrink-0 w-16 h-20 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-[#0B0B0F] dark:text-white font-bebas tracking-wide text-lg leading-none">
                                    SUMMONED TO SCROLL
                                </h4>
                                <button
                                    onClick={closeNotification}
                                    className="text-gray-400 hover:text-red-500 transition-colors -mt-1 -mr-2 p-1"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold truncate pr-4">
                                {item.name}
                            </p>

                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-primary font-bold text-sm">
                                    {formatCurrency(item.price, settings.currency_symbol || '$')}
                                </span>
                                <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">
                                    Qty: {item.quantity}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-1 flex">
                        <button
                            onClick={handleViewCart}
                            className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                            style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 100%)' }} // Slight crop top-left
                        >
                            View Archive
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShinobiToast;
