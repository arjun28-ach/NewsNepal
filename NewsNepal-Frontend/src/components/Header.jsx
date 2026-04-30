import { useState } from 'react';
import {
  Box,
  Flex,
  Button,
  useColorMode,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Badge,
  Container,
  VStack,
  useBreakpointValue,
  Avatar,
  Text,
  HStack,
  MenuDivider,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaMoon, FaSun, FaBookmark, FaUser, FaBars, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';
import { AuthModal } from './AuthModal';
import { Logo } from './Logo';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';

export const Header = ({ isAuthenticated, user, onLanguageChange, bookmarkCount = 0 }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen: isAuthOpen, onOpen: onAuthOpen, onClose: onAuthClose } = useDisclosure();
  const { isOpen: isMobileMenuOpen, onToggle: onMobileMenuToggle } = useDisclosure();
  const [authType, setAuthType] = useState('login');
  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();
  const location = useLocation();

  const bgGradient = colorMode === 'light'
    ? 'linear(to-r, nepal.red, nepal.blue)'
    : 'linear(to-r, nepal.darkRed, nepal.darkBlue)';
  const borderColor = colorMode === 'light' ? 'whiteAlpha.300' : 'rgba(255, 255, 255, 0.1)';
  const buttonHoverBg = colorMode === 'light' ? 'whiteAlpha.200' : 'whiteAlpha.100';

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAuthClick = (type) => {
    setAuthType(type);
    onAuthOpen();
  };

  const MobileNavItem = ({ label, children, href, onClick, onMobileMenuToggle }) => {
    const { isOpen, onToggle } = useDisclosure();
    const location = useLocation();
    const isActive = href && location.pathname === href;
    const { colorMode } = useColorMode();
    const buttonHoverBg = colorMode === 'light' ? 'whiteAlpha.200' : 'whiteAlpha.100';

    const handleClick = (e) => {
      if (onClick) {
        onClick();
        onMobileMenuToggle(); // Close mobile menu after action
      } else if (href) {
        onMobileMenuToggle(); // Close mobile menu when navigating
      }
    };

    return (
      <Stack spacing={4} onClick={handleClick}>
        <Flex
          py={2}
          as={href ? RouterLink : 'div'}
          to={href ?? '#'}
          justify={'space-between'}
          align={'center'}
          bg={isActive ? buttonHoverBg : 'transparent'}
          px={3}
          borderRadius="md"
          _hover={{
            textDecoration: 'none',
            bg: buttonHoverBg,
          }}
        >
          <Text
            fontWeight={600}
            color={'white'}
          >
            {label}
          </Text>
        </Flex>
      </Stack>
    );
  };

  return (
    <>
      <Box
        as="header"
        position="fixed"
        top={0}
        w="100%"
        zIndex={1000}
        bgGradient={bgGradient}
        borderBottom="1px"
        borderColor={borderColor}
        boxShadow="lg"
      >
        <Container maxW="1200px" px={4}>
          <Flex h="72px" align="center" justify="space-between">
            <RouterLink to="/">
              <Logo />
            </RouterLink>

            {isMobile ? (
              <>
                <IconButton
                  onClick={onMobileMenuToggle}
                  icon={isMobileMenuOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
                  variant={'ghost'}
                  color="white"
                  aria-label={'Toggle Navigation'}
                  _hover={{ bg: buttonHoverBg }}
                />
              </>
            ) : (
              <HStack spacing={4}>
                <DesktopNav />
                <HStack spacing={4}>
                  <Button
                    variant="ghost"
                    onClick={() => onLanguageChange('en')}
                    color="white"
                    _hover={{ bg: buttonHoverBg }}
                  >
                    EN
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onLanguageChange('np')}
                    color="white"
                    _hover={{ bg: buttonHoverBg }}
                  >
                    नेपाली
                  </Button>

                  <IconButton
                    icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
                    onClick={toggleColorMode}
                    variant="ghost"
                    color="white"
                    aria-label="Toggle theme"
                    _hover={{ bg: buttonHoverBg }}
                  />

                  {isAuthenticated && (
                    <Box position="relative">
                      <IconButton
                        as={RouterLink}
                        to="/bookmarks"
                        icon={<FaBookmark />}
                        variant="ghost"
                        color="white"
                        aria-label="Bookmarks"
                        _hover={{ bg: buttonHoverBg }}
                      />
                      {bookmarkCount > 0 && (
                        <Badge
                          position="absolute"
                          top="-1"
                          right="-1"
                          bg="white"
                          color="primary.100"
                          borderRadius="full"
                          fontSize="xs"
                        >
                          {bookmarkCount}
                        </Badge>
                      )}
                    </Box>
                  )}

                  {isAuthenticated ? (
                    <Menu>
                      <MenuButton
                        as={Button}
                        variant="ghost"
                        color="white"
                        rightIcon={<FaChevronDown />}
                        _hover={{ bg: buttonHoverBg }}
                      >
                        <HStack>
                          <Avatar
                            size="sm"
                            name={user?.name}
                            bg="white"
                            color="primary.100"
                          />
                          <Text>{user?.name}</Text>
                        </HStack>
                      </MenuButton>
                      <MenuList bg={colorMode === 'light' ? 'white' : 'accent.100'} borderColor={borderColor}>
                        <MenuItem
                          icon={<FaUser />}
                          as={RouterLink}
                          to="/profile"
                          _hover={{ bg: buttonHoverBg }}
                        >
                          Profile
                        </MenuItem>
                        <MenuDivider borderColor={borderColor} />
                        <MenuItem
                          icon={<FaSignOutAlt />}
                          onClick={handleLogout}
                          _hover={{ bg: buttonHoverBg }}
                        >
                          Logout
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  ) : (
                    <HStack spacing={2}>
                      <Button 
                        variant="ghost"
                        onClick={() => handleAuthClick('login')}
                        color="white"
                        _hover={{ bg: buttonHoverBg }}
                      >
                        Login
                      </Button>
                      <Button 
                        bg="white"
                        color="primary.100"
                        onClick={() => handleAuthClick('signup')}
                        _hover={{ bg: 'whiteAlpha.800' }}
                      >
                        Sign Up
                      </Button>
                    </HStack>
                  )}
                </HStack>
              </HStack>
            )}
          </Flex>

          {/* Mobile Navigation Menu */}
          <Collapse in={isMobileMenuOpen} animateOpacity>
            <Box
              py={4}
              borderTop={1}
              borderStyle={'solid'}
              borderColor={'whiteAlpha.200'}
            >
              <Stack spacing={4}>
                {NAV_ITEMS.map((navItem) => (
                  <MobileNavItem 
                    key={navItem.label} 
                    {...navItem} 
                    onMobileMenuToggle={onMobileMenuToggle}
                  />
                ))}
                
                <MobileNavItem
                  label="Language"
                  children={[
                    { label: 'English', href: '#', onClick: () => onLanguageChange('en') },
                    { label: 'नेपाली', href: '#', onClick: () => onLanguageChange('np') }
                  ]}
                  onMobileMenuToggle={onMobileMenuToggle}
                />
                
                <MobileNavItem
                  label="Theme"
                  onClick={toggleColorMode}
                  onMobileMenuToggle={onMobileMenuToggle}
                />

                {isAuthenticated ? (
                  <>
                    <MobileNavItem
                      label="Bookmarks"
                      href="/bookmarks"
                      onMobileMenuToggle={onMobileMenuToggle}
                    />
                    <MobileNavItem
                      label="Profile"
                      href="/profile"
                      onMobileMenuToggle={onMobileMenuToggle}
                    />
                    <MobileNavItem
                      label="Logout"
                      onClick={handleLogout}
                      onMobileMenuToggle={onMobileMenuToggle}
                    />
                  </>
                ) : (
                  <>
                    <MobileNavItem
                      label="Login"
                      onClick={() => {
                        handleAuthClick('login');
                        onMobileMenuToggle();
                      }}
                      onMobileMenuToggle={onMobileMenuToggle}
                    />
                    <MobileNavItem
                      label="Sign Up"
                      onClick={() => {
                        handleAuthClick('signup');
                        onMobileMenuToggle();
                      }}
                      onMobileMenuToggle={onMobileMenuToggle}
                    />
                  </>
                )}
              </Stack>
            </Box>
          </Collapse>
        </Container>
      </Box>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={onAuthClose}
        type={authType}
      />
    </>
  );
};

const DesktopNav = () => {
  const { colorMode } = useColorMode();
  const buttonHoverBg = colorMode === 'light' ? 'whiteAlpha.200' : 'whiteAlpha.100';
  const location = useLocation();

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => {
        const isActive = location.pathname === navItem.href;
        
        return (
          <Box key={navItem.label}>
            <Popover trigger={'hover'} placement={'bottom-start'}>
              <PopoverTrigger>
                <Button
                  as={RouterLink}
                  to={navItem.href ?? '#'}
                  variant="ghost"
                  color="white"
                  bg={isActive ? buttonHoverBg : 'transparent'}
                  _hover={{ bg: buttonHoverBg }}
                  position="relative"
                  rightIcon={navItem.children ? <ChevronDownIcon /> : undefined}
                  _after={{
                    content: '""',
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    height: '2px',
                    bg: 'white',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {navItem.label}
                </Button>
              </PopoverTrigger>

              {navItem.children && (
                <PopoverContent
                  border={0}
                  boxShadow={'xl'}
                  bg={colorMode === 'light' ? 'white' : 'gray.800'}
                  p={4}
                  rounded={'xl'}
                  minW={'sm'}
                >
                  <Stack>
                    {navItem.children.map((child) => (
                      <Box
                        key={child.label}
                        as={RouterLink}
                        to={child.href}
                        role={'group'}
                        display={'block'}
                        p={2}
                        rounded={'md'}
                        _hover={{ bg: useColorModeValue('nepal.red', 'nepal.darkRed') }}
                      >
                        <Stack direction={'row'} align={'center'}>
                          <Box>
                            <Text
                              transition={'all .3s ease'}
                              _groupHover={{ color: 'white' }}
                              fontWeight={500}
                            >
                              {child.label}
                            </Text>
                            <Text fontSize={'sm'}>{child.subLabel}</Text>
                          </Box>
                          <Flex
                            transition={'all .3s ease'}
                            transform={'translateX(-10px)'}
                            opacity={0}
                            _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
                            justify={'flex-end'}
                            align={'center'}
                            flex={1}
                          >
                            <Icon color={'white'} w={5} h={5} as={ChevronRightIcon} />
                          </Flex>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </PopoverContent>
              )}
            </Popover>
          </Box>
        );
      })}
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];