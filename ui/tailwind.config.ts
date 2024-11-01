import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-reverse': 'float 7s ease-in-out infinite reverse',
        'float-delayed-slow': 'float 9s ease-in-out 1s infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '25%': { transform: 'translate(20px, 20px) rotate(45deg)' },
          '50%': { transform: 'translate(-10px, 30px) rotate(90deg)' },
          '75%': { transform: 'translate(-20px, 10px) rotate(180deg)' },
          '100%': { transform: 'translate(0px, 0px) rotate(360deg)' },
        },
        floatReverse: {
          '0%': { transform: 'translate(0px, 0px) rotate(360deg)' },
          '25%': { transform: 'translate(-20px, 20px) rotate(270deg)' },
          '50%': { transform: 'translate(10px, 30px) rotate(180deg)' },
          '75%': { transform: 'translate(20px, 10px) rotate(90deg)' },
          '100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
