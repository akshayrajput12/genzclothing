import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'merriweather': ['Merriweather', 'serif'],
				'sans': ['Inter', 'sans-serif'],
				'display': ['"Space Grotesk"', 'sans-serif'],
				'handwritten': ['"Permanent Marker"', 'cursive'],
				'manga': ['"Noto Sans JP"', 'sans-serif'],
				'bebas': ['"Bebas Neue"', 'sans-serif'],
				'serif': ['Merriweather', 'serif'],
				'playfair': ['"Playfair Display"', 'serif'],
				'jetbrains': ['"JetBrains Mono"', 'monospace'],
			},
			colors: {
				'hero-primary': "#F97316", // Ninja Orange
				'hero-bg-light': "#F8FAFC", // Scroll White
				'hero-bg-dark': "#0B0B0F", // Shadow Black
				'ninja-orange': '#F97316',
				'shadow-black': '#0B0B0F',
				'scroll-white': '#F8FAFC',
				'smoke-grey': '#9CA3AF',
				'chakra-red': '#DC2626',
				'leaf-green': '#16A34A',
				'storm-blue': '#2563EB',
				border: 'var(--color-accent)', // Muted Brown for borders
				input: 'var(--color-secondary)', // Antique Bronze for inputs
				ring: 'var(--color-primary)', // Royal Gold for focus rings
				background: 'var(--color-bg)', // Light Sand Beige
				foreground: 'var(--color-dark)', // Deep Maroon
				primary: {
					DEFAULT: 'var(--color-primary)', // Royal Gold
					foreground: 'var(--color-light)', // Cream White
					hover: 'var(--color-secondary)', // Antique Bronze
				},
				secondary: {
					DEFAULT: 'var(--color-secondary)', // Antique Bronze
					foreground: 'var(--color-light)', // Cream White
				},
				destructive: {
					DEFAULT: 'var(--color-dark)', // Using Deep Maroon as strong emphasis/destructive replacement
					foreground: 'var(--color-light)',
				},
				muted: {
					DEFAULT: 'var(--color-soft-bg)', // Warm Blush Beige
					foreground: 'var(--color-accent)', // Muted Brown
				},
				accent: {
					DEFAULT: 'var(--color-soft)', // Peach Rose
					foreground: 'var(--color-dark)',
				},
				popover: {
					DEFAULT: 'var(--color-light)', // Cream White
					foreground: 'var(--color-dark)',
				},
				card: {
					DEFAULT: 'var(--color-soft)', // Peach Rose
					foreground: 'var(--color-dark)',
				},
				// Custom brand aliases if needed, or just map them to above
				blue: {
					DEFAULT: 'var(--color-primary)', // Replacing implicit usage of blue with primary
					foreground: 'var(--color-light)'
				},
				sidebar: {
					DEFAULT: 'var(--color-soft-bg)',
					foreground: 'var(--color-dark)',
					primary: 'var(--color-primary)',
					'primary-foreground': 'var(--color-light)',
					accent: 'var(--color-secondary)',
					'accent-foreground': 'var(--color-light)',
					border: 'var(--color-accent)',
					ring: 'var(--color-primary)'
				},
				// Admin colors mapped to new palette
				admin: {
					primary: 'var(--color-primary)',
					secondary: 'var(--color-secondary)',
					accent: 'var(--color-accent)',
					background: 'var(--color-bg)',
					card: 'var(--color-soft)'
				}
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'medium': 'var(--shadow-medium)',
				'large': 'var(--shadow-large)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
