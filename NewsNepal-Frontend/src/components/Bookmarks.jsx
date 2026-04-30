import {
  Box,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack,
  Container,
  Button,
  Center,
  Spinner,
  Heading,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { NewsCard } from './NewsCard';
import { getBookmarks } from '../api';
import { Navigate } from 'react-router-dom';

export const Bookmarks = ({ isAuthenticated, onBookmarkUpdate }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  const fetchBookmarks = async () => {
    try {
      const data = await getBookmarks();
      setBookmarks(data.bookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarks();
    }
  }, [isAuthenticated]);

  const handleBookmarkUpdate = () => {
    fetchBookmarks();
    onBookmarkUpdate?.();
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh" w="100%">
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      </Box>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <Box bg={bgColor} minH="100vh" w="100%">
        <Center py={10}>
          <Text fontSize="xl" color={textColor}>No bookmarks yet</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" w="100%">
      <Container maxW="6xl" py={8}>
        <Heading size="xl" mb={6} color={textColor}>
          Your Bookmarks
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {bookmarks.map((article) => (
            <NewsCard
              key={article.article_url}
              article={article}
              isAuthenticated={isAuthenticated}
              onBookmarkUpdate={handleBookmarkUpdate}
              isBookmarked={true}
            />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}; 