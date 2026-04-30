import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  useColorMode,
  IconButton,
  Link,
  VisuallyHidden,
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube, FaInstagram } from 'react-icons/fa';
import { Logo } from './Logo';

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2} color="white">
      {children}
    </Text>
  );
};

const SocialButton = ({ children, label, href }) => {
  const { colorMode } = useColorMode();
  
  return (
    <IconButton
      bg={colorMode === 'light' ? 'whiteAlpha.100' : 'whiteAlpha.100'}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: colorMode === 'light' ? 'nepal.darkRed' : 'nepal.darkBlue',
        transform: 'translateY(-2px)',
      }}
      icon={children}
      aria-label={label}
      color="white"
    />
  );
};

export default function Footer() {
  const { colorMode } = useColorMode();
  
  const bgGradient = colorMode === 'light'
    ? 'linear(to-r, nepal.red, nepal.blue)'
    : 'linear(to-r, nepal.darkRed, nepal.darkBlue)';

  return (
    <Box
      bgGradient={bgGradient}
      color="white"
      mt="auto"
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Link href={'#'}>About Us</Link>
            <Link href={'#'}>Blog</Link>
            <Link href={'#'}>Careers</Link>
            <Link href={'#'}>Contact Us</Link>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Support</ListHeader>
            <Link href={'#'}>Help Center</Link>
            <Link href={'#'}>Safety Center</Link>
            <Link href={'#'}>Community Guidelines</Link>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Legal</ListHeader>
            <Link href={'#'}>Cookies Policy</Link>
            <Link href={'#'}>Privacy Policy</Link>
            <Link href={'#'}>Terms of Service</Link>
            <Link href={'#'}>Law Enforcement</Link>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Follow Us</ListHeader>
            <Stack direction={'row'} spacing={6}>
              <SocialButton label={'Twitter'} href={'#'}>
                <FaTwitter />
              </SocialButton>
              <SocialButton label={'YouTube'} href={'#'}>
                <FaYoutube />
              </SocialButton>
              <SocialButton label={'Instagram'} href={'#'}>
                <FaInstagram />
              </SocialButton>
            </Stack>
          </Stack>
        </SimpleGrid>
      </Container>

      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={colorMode === 'light' ? 'whiteAlpha.300' : 'whiteAlpha.300'}
      >
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <Logo />
          <Text>© 2025 News Nepal. All rights reserved</Text>
        </Container>
      </Box>
    </Box>
  );
} 