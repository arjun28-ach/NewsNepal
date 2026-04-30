import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  SimpleGrid,
  Icon,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGraduationCap, FaCode, FaNewspaper } from 'react-icons/fa';

export const AboutUs = () => {
  const { colorMode } = useColorMode();
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('gray.900', 'white');
  const bodyColor = useColorModeValue('gray.700', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.300');
  
  const bgGradient = colorMode === 'light'
    ? 'linear(to-r, nepal.red, nepal.blue)'
    : 'linear(to-r, nepal.darkRed, nepal.darkBlue)';

  return (
    <Box bg={pageBg} minH="100vh" color={bodyColor}>
      {/* Hero Section */}
      <Box
        bgGradient={bgGradient}
        color="white"
        py={20}
        mb={10}
      >
        <Container maxW="4xl">
          <VStack spacing={6} align="center" textAlign="center">
            <Heading as="h1" size="2xl">
              About News Nepal
            </Heading>
            <Text fontSize="xl">
              Your trusted source for comprehensive news coverage in Nepal
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Developer Profile */}
      <Container maxW="4xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" mb={8}>
            <Heading as="h2" size="xl" mb={4} color={headingColor}>
              Meet the Developer
            </Heading>
            <Text fontSize="lg" color={mutedColor}>
              The mind behind News Nepal
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <Box>
              <VStack spacing={4} align="start">
                <Heading as="h3" size="lg" color={headingColor}>
                  Arjun Acharya
                </Heading>
                <Text fontSize="md" color={mutedColor}>
                  Software Developer
                </Text>
                <Text color={bodyColor}>
                  A passionate software developer with expertise in building modern web applications.
                  Committed to creating innovative solutions that make a difference in people's lives.
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Qualifications */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mt={10}>
            <Box
              p={6}
              borderRadius="lg"
              bg={cardBg}
              boxShadow="xl"
              _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s ease' }}
            >
              <Icon as={FaGraduationCap} w={10} h={10} color="nepal.red" mb={4} />
              <Heading as="h4" size="md" mb={4} color={headingColor}>
                Education
              </Heading>
              <Text color={bodyColor}>
                Bachelor's Degree in Computer Engineering from Tribhuvan University, Nepal
              </Text>
            </Box>

            <Box
              p={6}
              borderRadius="lg"
              bg={cardBg}
              boxShadow="xl"
              _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s ease' }}
            >
              <Icon as={FaCode} w={10} h={10} color="nepal.blue" mb={4} />
              <Heading as="h4" size="md" mb={4} color={headingColor}>
                Expertise
              </Heading>
              <Text color={bodyColor}>
                Full-stack development with modern technologies and frameworks
              </Text>
            </Box>

            <Box
              p={6}
              borderRadius="lg"
              bg={cardBg}
              boxShadow="xl"
              _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s ease' }}
            >
              <Icon as={FaNewspaper} w={10} h={10} color="nepal.red" mb={4} />
              <Heading as="h4" size="md" mb={4} color={headingColor}>
                News Nepal
              </Heading>
              <Text color={bodyColor}>
                Created to provide reliable and accessible news coverage for Nepal
              </Text>
            </Box>
          </SimpleGrid>

          {/* Mission Statement */}
          <Box
            mt={16}
            p={8}
            borderRadius="lg"
            bgGradient={bgGradient}
            color="white"
          >
            <VStack spacing={4} textAlign="center">
              <Heading as="h3" size="lg">
                Our Mission
              </Heading>
              <Text fontSize="lg">
                To deliver accurate, timely, and comprehensive news coverage while promoting
                transparency and fostering informed discourse in Nepalese society.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}; 
