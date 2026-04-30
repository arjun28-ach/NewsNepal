import { Grid, Button, Center, Spinner, useToast, Text, VStack, Box, useColorModeValue } from '@chakra-ui/react';
import { useInfiniteQuery } from 'react-query';
import { NewsCard } from './NewsCard';
import { fetchNews } from '../api';

export const NewsFeed = ({ language, isAuthenticated, onBookmarkUpdate }) => {
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery(
    ['news', language],
    ({ pageParam = 1 }) => fetchNews({ 
      page: pageParam, 
      language,
      per_page: 20 
    }),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.total_pages) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      staleTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,  // Don't refetch on window focus
      retry: 1,  // Only retry once
      onError: (error) => {
        toast({
          title: 'Error loading news',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );

  const handleBookmark = async (article) => {
    if (!isAuthenticated) {
      toast({
        title: 'Please login to bookmark articles',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      await onBookmark(article);
      if (onBookmarkUpdate) {
        onBookmarkUpdate();
      }
    } catch (error) {
      toast({
        title: 'Error bookmarking article',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <Center py={20} bg={bgColor} minH="100vh">
        <VStack spacing={4}>
          <Spinner 
            size="xl" 
            thickness="4px"
            speed="0.65s"
            color="nepal.red"
          />
          <Text>Loading news...</Text>
        </VStack>
      </Center>
    );
  }

  if (isError) {
    return (
      <Center h="100vh" bg={bgColor}>
        <VStack spacing={4}>
          <Text color="red.500">Error loading news: {error.message}</Text>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </VStack>
      </Center>
    );
  }

  const articles = data?.pages.flatMap(page => page.articles) || [];

  if (articles.length === 0) {
    return (
      <Center h="100vh" bg={bgColor}>
        <Text>No news articles found.</Text>
      </Center>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" w="100%">
      <VStack spacing={6} w="full" p={4}>
        <Grid
          templateColumns={{ 
            base: '1fr', 
            md: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          }}
          gap={6}
          w="full"
        >
          {articles.map((article, index) => (
            <NewsCard
              key={`${article.url}-${index}`}
              article={article}
              isAuthenticated={isAuthenticated}
              onBookmark={handleBookmark}
              onBookmarkUpdate={onBookmarkUpdate}
            />
          ))}
        </Grid>

        {hasNextPage && (
          <Button
            onClick={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
            loadingText="Loading more..."
            size="lg"
            colorScheme="blue"
            width={{ base: 'full', md: 'auto' }}
            my={4}
          >
            Load More News
          </Button>
        )}

        {!hasNextPage && articles.length > 0 && (
          <Text color={useColorModeValue('gray.600', 'gray.400')} mt={4}>
            You've reached the end
          </Text>
        )}
      </VStack>
    </Box>
  );
};
