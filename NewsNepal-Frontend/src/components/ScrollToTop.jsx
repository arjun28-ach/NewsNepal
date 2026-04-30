import { useState, useEffect } from 'react';
import { IconButton } from '@chakra-ui/react';
import { FaArrowUp } from 'react-icons/fa';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <IconButton
          onClick={scrollToTop}
          icon={<FaArrowUp />}
          position="fixed"
          bottom="20px"
          right="20px"
          zIndex={3}
          colorScheme="nepal"
          bg="nepal.red"
          color="white"
          size="lg"
          isRound
          aria-label="Scroll to top"
          boxShadow="lg"
          _hover={{
            bg: 'nepal.darkRed',
            transform: 'translateY(-2px)',
          }}
          _active={{
            bg: 'nepal.darkRed',
          }}
        />
      )}
    </>
  );
}; 