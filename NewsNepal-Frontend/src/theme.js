import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  colors: {
    nepal: {
      red: '#DC143C',    // Crimson red from Nepal flag
      darkRed: '#B01030', // Darker shade of crimson
      blue: '#003893',    // Navy blue from Nepal flag
      darkBlue: '#002870', // Darker shade of navy
    },
    primary: {
      100: '#DC143C', // Using Nepal red as primary
      200: '#003893', // Using Nepal blue as secondary
    },
    accent: {
      100: '#333333', // Dark navy
      200: '#FFB935', // Yellow
      300: '#61656A', // Gray
      400: '#FF1843', // Red
      500: '#FFFFFF', // White
    },
    gradient: {
      100: '#C4D0A9', // Purple
      200: '#FFB935', // Yellow
      300: '#FF4141', // Red
      400: '#FE6587', // Pink
      500: '#0084FF', // Blue
      600: '#FC4B3D', // Coral
    },
    brand: {
      50: '#E5F0FF',
      100: '#B8D5FF',
      200: '#8ABBFF',
      300: '#5CA1FF',
      400: '#2E87FF',
      500: '#006EFF',
      600: '#0058CC',
      700: '#004299',
      800: '#002B66',
      900: '#001533',
    },
  },
  fonts: {
    heading: 'Roboto, sans-serif',
    body: 'Roboto, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: '8px',
      },
      variants: {
        primary: {
          bg: 'nepal.red',
          color: 'white',
          _hover: {
            bg: 'nepal.darkRed',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            bg: 'nepal.darkRed',
          },
        },
        secondary: {
          bg: 'nepal.blue',
          color: 'white',
          _hover: {
            bg: 'nepal.darkBlue',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
        },
        nepal: (props) => ({
          bgGradient: props.colorMode === 'dark' 
            ? 'linear(to-r, nepal.darkRed, nepal.darkBlue)'
            : 'linear(to-r, nepal.red, nepal.blue)',
          color: 'white',
          _hover: {
            bgGradient: props.colorMode === 'dark'
              ? 'linear(to-r, nepal.red, nepal.blue)'
              : 'linear(to-r, nepal.darkRed, nepal.darkBlue)',
          },
        }),
      },
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'accent.100' : 'white',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)',
          },
        },
      }),
    },
    Heading: {
      baseStyle: {
        fontWeight: 'bold',
        letterSpacing: '-0.02em',
      },
      sizes: {
        xl: {
          fontSize: '22px',
          lineHeight: '28px',
        },
        lg: {
          fontSize: '20px',
          lineHeight: '26px',
        },
        md: {
          fontSize: '16px',
          lineHeight: '24px',
        },
      },
    },
    Text: {
      baseStyle: {
        fontSize: '14px',
        lineHeight: '20px',
      },
    },
    Link: {
      baseStyle: {
        transition: 'all 0.3s ease',
        _hover: {
          textDecoration: 'none',
          color: 'primary.100',
        },
      },
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        },
      }),
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'accent.100' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'accent.100',
      },
    }),
  },
  shadows: {
    card: '0 0 30px rgba(0, 0, 0, 0.05)',
    hover: '0 0 30px rgba(0, 0, 0, 0.1)',
  },
});

export default theme; 