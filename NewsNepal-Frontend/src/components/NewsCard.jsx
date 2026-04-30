import {
  Box,
  Image,
  Text,
  Stack,
  Heading,
  IconButton,
  useToast,
  useColorModeValue,
  HStack,
  Button,
  Badge,
} from '@chakra-ui/react';
import { FaBookmark, FaRegBookmark, FaShare } from 'react-icons/fa';
import { bookmarkArticle, removeBookmark } from '../api';

export const NewsCard = ({ article, isAuthenticated, onBookmarkUpdate, isBookmarked = false }) => {
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'accent.100');
  const borderColor = useColorModeValue('gray.100', 'accent.300');
  const textColor = useColorModeValue('accent.300', 'gray.300');
  const headingColor = useColorModeValue('accent.100', 'white');
  const buttonHoverBg = useColorModeValue('gray.100', 'accent.300');

  // Get the correct article URL whether it's from the API or bookmarks
  const getArticleUrl = () => {
    return article.article_url || article.url;
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to bookmark articles',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      if (isBookmarked) {
        await removeBookmark(getArticleUrl());
      } else {
        const bookmarkData = {
          article_url: getArticleUrl(),
          title: article.title,
          summary: article.summary,
          image_url: article.image_url || '',
          published_at: article.published_at || new Date().toISOString(),
          category: article.category || 'general',
          source: article.source || 'Unknown',
          language: article.language || 'en'
        };
        await bookmarkArticle(bookmarkData);
      }
      
      onBookmarkUpdate?.();

      toast({
        title: isBookmarked ? 'Bookmark removed' : 'Article bookmarked',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Bookmark error:', error);
      toast({
        title: isBookmarked ? 'Error removing bookmark' : 'Error bookmarking article',
        description: error.response?.data?.message || `Failed to ${isBookmarked ? 'remove' : 'add'} bookmark`,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article.title,
        text: article.summary,
        url: getArticleUrl(),
      });
    } catch (error) {
      navigator.clipboard.writeText(getArticleUrl());
      toast({
        title: 'Link copied to clipboard',
        status: 'success',
        duration: 2000,
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box
      maxW="full"
      h="full"
      borderWidth="1px"
      borderRadius="12px"
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="card"
      transition="all 0.3s ease"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'hover' }}
      display="flex"
      flexDirection="column"
    >
      <Box position="relative">
        <Image
          src={article.image_url}
          alt={article.title}
          height="200px"
          width="100%"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/400x200"
        />
        <Box
          position="absolute"
          top="0"
          right="0"
          p={2}
        >
          <IconButton
            icon={isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            variant="solid"
            colorScheme="primary"
            bg="primary.100"
            onClick={handleBookmark}
            size="sm"
            _hover={{ bg: 'brand.600' }}
          />
        </Box>
      </Box>

      <Stack p={4} spacing={3} flex="1">
        <Heading size="md" noOfLines={2} color={headingColor}>
          {article.title}
        </Heading>

        <Text
          noOfLines={7}
          color={textColor}
          fontSize="sm"
          whiteSpace="pre-line"
          lineHeight="1.6"
        >
          {article.summary}
        </Text>

        <HStack justify="space-between" align="center" fontSize="xs">
          <Text fontWeight="bold" color={textColor}>
            {article.source}
          </Text>
          {article.language && (
            <Badge colorScheme={article.language === 'np' ? 'green' : 'blue'}>
              {article.language.toUpperCase()}
            </Badge>
          )}
          <Text color={textColor}>
            {article.published_at && formatDate(article.published_at)}
          </Text>
        </HStack>

        <HStack justify="space-between" align="center" pt={2} mt="auto">
          <Button
            as="a"
            href={getArticleUrl()}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="primary"
            width="full"
          >
            Read Full Article
          </Button>

          <IconButton
            icon={<FaShare />}
            aria-label="Share article"
            variant="ghost"
            colorScheme="primary"
            onClick={handleShare}
            size="sm"
            _hover={{ bg: buttonHoverBg }}
          />
        </HStack>
      </Stack>
    </Box>
  );
};
