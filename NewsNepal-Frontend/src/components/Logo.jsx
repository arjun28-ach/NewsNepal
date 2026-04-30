import { Box, Text } from '@chakra-ui/react';

export const Logo = () => {
  return (
    <Box
      as="div"
      display="flex"
      alignItems="center"
      gap={2}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ opacity: 0.9 }}
    >
      {/* Nepal Flag Logo */}
      <Box
        w="40px"
        h="40px"
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="#003893" 
            stroke="#DC143C" 
            strokeWidth="2"
          />
          
          {/* Nepal Flag - Vertical */}
          <path
            d="M30 20
               L70 35
               L30 50
               L70 65
               L30 80
               L30 20
               Z"
            fill="#DC143C"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
        </svg>
      </Box>

      {/* Text Logo */}
      <Text
        fontSize="24px"
        fontWeight="bold"
        color="white"
        letterSpacing="tight"
      >
        NewsNepal
      </Text>
    </Box>
  );
}; 