const tintColorLight = '#DD2222'; // Red color for light theme
const tintColorDark = '#DD2222'; // Red color for dark theme

export const Colors = {
  light: {
    text: '#11181C', // Dark text for light mode
    background: '#E0E0E0', // Light grey background
    tint: tintColorLight, // Red color
    icon: '#ff0000', // Red color for icons
    tabIconDefault: '#ff0000', // Default tab icon color (red)
    tabIconSelected: tintColorLight, // Selected tab icon color (red)
  },
  dark: {
    text: '#ECEDEE', // Light text for dark mode
    background: '#333333', // Dark grey background for dark mode
    tint: tintColorDark, // Red color
    icon: '#ff0000', // Red color for icons
    tabIconDefault: '#ff0000', // Default tab icon color (red)
    tabIconSelected: tintColorDark, // Selected tab icon color (red)
  },
} as const; // 'as const' ensures literal types for 'light' and 'dark'
