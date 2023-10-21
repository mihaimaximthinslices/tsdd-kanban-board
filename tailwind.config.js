/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue2: '#635FC7',
        blue1: '#A8A4FF',
        black4: '#000112',
        black3: '#20212C',
        black2: '#2B2C37',
        black1: '#3E3F4E',
        white4: '#828FA3',
        white3: '#E4EBFA',
        white2: '#F4F7FD',
        white1: '#FFFFFF',
        red2: '#EA5555',
        red1: '#FF9898',
        systemBlue: '#358ce9',
        googleButton: '#333333',
        imageGray: '#f0f0f0',
      },
    },
    backgroundImage: {
      'app-preview': "url('/public/photos/app-preview.jpg')",
    },
    screens: {
      '1xl': '1440px',
      sm: '450px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    fontSize: {
      headingXL: '24px',
      headingL: '18px',
      headingM: '15px',
      headingS: '12px',
      bodyL: '13px',
      bodyM: '12px',
    },
    lineHeight: {
      headingXL: '30px',
      headingL: '23px',
      headingM: '19px',
      headingS: '15px',
      bodyL: '23px',
      bodyM: '12px',
    },
    letterSpacing: {
      headingS: '2.4px',
    },
    fontFamily: {
      plusJSans: ['Plus Jakarta Sans', 'sans-serif'],
    },
  },
  plugins: [],
}
