import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Link,
  useColorMode,
  Button,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaLinkedin } from 'react-icons/fa';

export default function Contact() {
  const { colorMode } = useColorMode();
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const panelBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.900', 'white');
  const bodyColor = useColorModeValue('gray.700', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.300');
  
  const bgGradient = colorMode === 'light'
    ? 'linear(to-r, nepal.red, nepal.blue)'
    : 'linear(to-r, nepal.darkRed, nepal.darkBlue)';

  return (
    <Box bg={pageBg} minH="100vh">
      <Container maxW="4xl" py={{ base: 16, md: 20 }} px={{ base: 4, md: 8 }}>
      <VStack spacing={8} align="start" w="full">
        <Box
          w="full"
          p={{ base: 6, md: 8 }}
          borderRadius="lg"
          bgGradient={bgGradient}
          color="white"
        >
          <VStack spacing={4} align="start">
            <Heading size={{ base: "lg", md: "xl" }}>Contact Us</Heading>
            <Text fontSize={{ base: "md", md: "lg" }}>
              Feel free to reach out for any questions, suggestions, or collaboration opportunities.
            </Text>
          </VStack>
        </Box>

        <VStack spacing={6} align="start" w="full" p={{ base: 4, md: 8 }} bg={panelBg} borderRadius="lg" boxShadow="card">
          <Heading size={{ base: "md", md: "lg" }} color={headingColor}>Contact Information</Heading>
          
          <VStack spacing={4} align="start" w="full">
            <Box>
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={headingColor}>Arjun Acharya</Text>
              <Text color={mutedColor}>Full Stack Developer</Text>
            </Box>

            <Stack
              direction={{ base: 'column', sm: 'row' }}
              spacing={4}
              w={{ base: 'full', sm: 'auto' }}
            >
              <Link 
                href="https://www.linkedin.com/in/arjun-acharya-935230194/"
                isExternal
                w={{ base: 'full', sm: 'auto' }}
              >
                <Button
                  leftIcon={<FaLinkedin />}
                  colorScheme="linkedin"
                  variant="solid"
                  w={{ base: 'full', sm: 'auto' }}
                >
                  Connect on LinkedIn
                </Button>
              </Link>

              <Link 
                href="https://www.linkedin.com/in/arjun-acharya-935230194/message/"
                isExternal
                w={{ base: 'full', sm: 'auto' }}
              >
                <Button
                  leftIcon={<FaLinkedin />}
                  colorScheme="linkedin"
                  variant="outline"
                  w={{ base: 'full', sm: 'auto' }}
                >
                  Message on LinkedIn
                </Button>
              </Link>
            </Stack>

            <Box mt={6}>
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold" color={headingColor}>About Me</Text>
              <Text color={bodyColor} mt={2} fontSize={{ base: "sm", md: "md" }}>
                I am a passionate Full Stack Developer with expertise in web development
                and a strong focus on creating user-friendly applications. I specialize in
                building modern web applications using React, Node.js, and various other
                technologies.
              </Text>
            </Box>
          </VStack>
        </VStack>
      </VStack>
      </Container>
    </Box>
  );
} 
