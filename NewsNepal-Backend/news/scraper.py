import requests
import feedparser
from bs4 import BeautifulSoup
from newspaper import Article
import logging
from datetime import datetime, timedelta, timezone as dt_timezone
import concurrent.futures
import random
import math
from time import sleep
from random import uniform
import nltk
from urllib.parse import urljoin, urlparse
from calendar import timegm

# --- STANDALONE CONFIGURATION & UTILITIES ---

# Define UTC once for all timezone-aware datetime objects
UTC = dt_timezone.utc 

# --- STANDALONE CACHING LOGIC (Replaces django.core.cache) ---
STANDALONE_CACHE = {} 
CACHE_TIMEOUT = 120 # 2 minutes in seconds

def set_cache(key, value, timeout=CACHE_TIMEOUT):
    """Sets a value in the standalone cache."""
    expiry = datetime.now(UTC) + timedelta(seconds=timeout)
    STANDALONE_CACHE[key] = {'data': value, 'expiry': expiry}

def get_cache(key):
    """Retrieves a value from the standalone cache, checking expiry."""
    entry = STANDALONE_CACHE.get(key)
    if entry:
        if datetime.now(UTC) < entry['expiry']:
            return entry['data']
        else:
            del STANDALONE_CACHE[key] # Expire and remove
    return None

def delete_cache(key):
    """Deletes a key from the cache."""
    if key in STANDALONE_CACHE:
        del STANDALONE_CACHE[key]
        return True
    return False

# --- ANTI-BLOCKING: DYNAMIC USER-AGENT ROTATION ---
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36 Edg/92.0.902.55',
]

def get_random_user_agent():
    """Returns a random User-Agent string."""
    return random.choice(USER_AGENTS)

# Download NLTK data silently
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

# Update logging configuration to be less verbose
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Configure requests session
session = requests.Session()
session.headers.update({
    'User-Agent': get_random_user_agent(), 
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
})

# Keep network calls short so the API can respond before frontend timeouts.
REQUEST_TIMEOUT = 6
ARTICLES_PER_SITE = 8
PLACEHOLDER_IMAGE = 'https://placehold.co/800x450/e2e8f0/1a202c?text=NewsNepal'

# Feed-first sources are faster and more reliable than homepage CSS scraping.
NEWS_SITES = [
    {
        'url': 'https://kathmandupost.com',
        'language': 'en',
        'name': 'The Kathmandu Post',
        'feed_urls': ['https://kathmandupost.com/rss'],
        'article_selector': '.article-item, article.normal, div.article',
        'title_selector': 'h3 a, .article-header a, h2.article-header a',
        'summary_selector': '.article-excerpt, .description p',
        'image_selector': '.article-image img, .image-container img, meta[property="og:image"]',
        'date_selector': 'time, .published-date',
    },
    {
        'url': 'https://thehimalayantimes.com',
        'language': 'en',
        'name': 'The Himalayan Times',
        'feed_urls': [],
        'limit': 500,
        'article_selector': '.jeg_posts article, .jeg_post',
        'title_selector': '.jeg_post_title a',
        'summary_selector': '.jeg_post_excerpt p, .jeg_excerpt',
        'image_selector': '.jeg_thumb img',
        'date_selector': '.jeg_meta_date',
        'categories': [
            {'path': '', 'category': 'all'}
        ]
    },
    {
        'url': 'https://english.onlinekhabar.com',
        'language': 'en',
        'name': 'Online Khabar',
        'feed_urls': ['https://english.onlinekhabar.com/feed'],
        'limit': 500,
        'article_selector': 'article.list-item, .ok-news-post',
        'title_selector': 'h2 a',
        'summary_selector': '.excerpt',
        'image_selector': '.featured-image img',
        'date_selector': '.post-date',
        'categories': [
            {'path': '', 'category': 'all'}
        ]
    },
    {
        'url': 'https://myrepublica.nagariknetwork.com',
        'language': 'en',
        'name': 'Republica',
        'feed_urls': [],
        'limit': 200,
        'article_selector': '.article-item, .news-item',
        'title_selector': 'h3 a, .title a',
        'summary_selector': '.summary, .excerpt',
        'image_selector': '.featured-image img, .article-image img',
        'date_selector': '.date, .published-date',
        'categories': [
            {'path': '', 'category': 'all'},
            {'path': '/category/politics', 'category': 'politics'},
            {'path': '/category/economy', 'category': 'business'},
            {'path': '/category/society', 'category': 'society'}
        ]
    },
    {
        'url': 'https://nepalnews.com',
        'language': 'en',
        'name': 'Nepal News',
        'feed_urls': ['https://nepalnews.com/feed'],
        'limit': 200,
        'article_selector': '.news-card, article',
        'title_selector': '.card-title a, h2 a',
        'summary_selector': '.card-text, .excerpt',
        'image_selector': '.card-img-top, .featured-image img',
        'date_selector': '.date, time',
        'categories': [
            {'path': '', 'category': 'all'},
            {'path': '/category/politics', 'category': 'politics'},
            {'path': '/category/business', 'category': 'business'},
            {'path': '/category/society', 'category': 'society'}
        ]
    },
    {
        'url': 'https://risingnepaldaily.com',
        'language': 'en',
        'name': 'The Rising Nepal',
        'feed_urls': ['https://risingnepaldaily.com/rss'],
        'limit': 200,
        'article_selector': '.news-post, article',
        'title_selector': '.entry-title a, h2 a',
        'summary_selector': '.entry-content p, .excerpt',
        'image_selector': '.entry-thumbnail img, .featured-image img',
        'date_selector': '.entry-date, .post-date',
        'categories': [
            {'path': '', 'category': 'all'}
        ]
    },
    {
        'url': 'https://setopati.com',
        'language': 'np',
        'name': 'Setopati',
        'feed_urls': ['https://setopati.com/feed'],
        'article_selector': 'article, .news-item, .items, .post',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    },
    {
        'url': 'https://www.ratopati.com',
        'language': 'np',
        'name': 'Ratopati',
        'feed_urls': ['https://www.ratopati.com/feed'],
        'article_selector': 'article, .news-item, .post, .item',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    },
    {
        'url': 'https://english.ratopati.com',
        'language': 'en',
        'name': 'Ratopati English',
        'feed_urls': ['https://english.ratopati.com/feed'],
        'article_selector': 'article, .news-item, .post, .item',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    },
    {
        'url': 'https://gorkhapatraonline.com',
        'language': 'np',
        'name': 'Gorkhapatra Online',
        'feed_urls': ['https://gorkhapatraonline.com/rss'],
        'article_selector': 'article, .news-item, .post, .item',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    },
    {
        'url': 'https://annapurnapost.com',
        'language': 'np',
        'name': 'Annapurna Post',
        'feed_urls': ['https://annapurnapost.com/rss'],
        'article_selector': 'article, .news-item, .post, .item',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    },
    {
        'url': 'https://theannapurnaexpress.com',
        'language': 'en',
        'name': 'Annapurna Express',
        'feed_urls': ['https://theannapurnaexpress.com/rss'],
        'article_selector': 'article, .news-item, .post, .item',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    },
    {
        'url': 'https://deshsanchar.com',
        'language': 'np',
        'name': 'Desh Sanchar',
        'feed_urls': ['https://deshsanchar.com/feed'],
        'article_selector': 'article, .news-item, .post, .item',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    },
    {
        'url': 'https://english.khabarhub.com',
        'language': 'en',
        'name': 'Khabarhub English',
        'feed_urls': ['https://english.khabarhub.com/feed'],
        'article_selector': 'article, .news-item, .post, .item',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    },
    {
        'url': 'https://bizmandu.com',
        'language': 'np',
        'name': 'Bizmandu',
        'feed_urls': ['https://bizmandu.com/feed'],
        'article_selector': 'article, .news-item, .post, .item',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    },
    {
        'url': 'https://www.techpana.com',
        'language': 'np',
        'name': 'TechPana',
        'feed_urls': ['https://www.techpana.com/feed'],
        'article_selector': 'article, .news-item, .post, .item',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    },
    {
        'url': 'https://nepalsamaya.com',
        'language': 'np',
        'name': 'Nepal Samaya',
        'feed_urls': ['https://nepalsamaya.com/feed'],
        'article_selector': 'article, .news-item, .post, .item',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    },
    {
        'url': 'https://baahrakhari.com',
        'language': 'np',
        'name': 'Baahrakhari',
        'feed_urls': ['https://baahrakhari.com/feed'],
        'article_selector': 'article, .news-item, .post, .item',
        'title_selector': 'h1 a, h2 a, h3 a, a',
        'summary_selector': 'p',
        'image_selector': 'img',
        'date_selector': 'time, .date',
    }
]

def clean_text(value):
    if not value:
        return ''
    text = BeautifulSoup(str(value), 'html.parser').get_text(' ', strip=True)
    return ' '.join(text.split())

def normalize_url(base_url, value):
    if not value:
        return None
    value = str(value).strip()
    if value.startswith('//'):
        return f'https:{value}'
    if value.startswith('/'):
        return urljoin(base_url, value)
    if value.startswith('http'):
        return value
    return urljoin(base_url, value)

def is_usable_image_url(value):
    if not value:
        return False
    parsed = urlparse(value)
    return parsed.scheme in {'http', 'https'} and bool(parsed.netloc)

def entry_datetime(entry):
    parsed = getattr(entry, 'published_parsed', None) or getattr(entry, 'updated_parsed', None)
    if parsed:
        return datetime.fromtimestamp(timegm(parsed), UTC)
    return datetime.now(UTC)

def entry_image(entry):
    media_content = getattr(entry, 'media_content', None) or []
    for media in media_content:
        url = media.get('url')
        if url:
            return url

    media_thumbnail = getattr(entry, 'media_thumbnail', None) or []
    for media in media_thumbnail:
        url = media.get('url')
        if url:
            return url

    links = getattr(entry, 'links', None) or []
    for link in links:
        if str(link.get('type', '')).startswith('image/') and link.get('href'):
            return link.get('href')

    for html_value in [
        getattr(entry, 'summary', '') or '',
        getattr(entry, 'description', '') or '',
        ' '.join([getattr(content, 'value', '') for content in getattr(entry, 'content', [])]),
    ]:
        soup = BeautifulSoup(html_value, 'html.parser')
        image = soup.select_one('img')
        if image:
            return image.get('src') or image.get('data-src') or image.get('data-lazy-src')
    return None

def structured_summary(title, summary, source):
    title = clean_text(title)
    summary = clean_text(summary)

    if not summary or summary.lower() == title.lower():
        summary = title

    words = summary.split()
    if len(words) > 110:
        summary = ' '.join(words[:110]) + '...'

    if len(summary.split()) < 12:
        return f"What happened: {title}\nWhy it matters: Read the full report from {source} for the latest details."

    return f"What happened: {summary}\nWhy it matters: This update comes from {source} and links to the original full report."

def fetch_article_metadata(url):
    try:
        session.headers.update({'User-Agent': get_random_user_agent()})
        response = session.get(url, timeout=REQUEST_TIMEOUT, verify=True)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        def meta_text(*selectors):
            for selector in selectors:
                elem = soup.select_one(selector)
                if elem:
                    content = elem.get('content')
                    if content:
                        return clean_text(content)
            return None

        def meta_url(*selectors):
            for selector in selectors:
                elem = soup.select_one(selector)
                if elem:
                    content = elem.get('content') or elem.get('href') or elem.get('src')
                    if content:
                        return content.strip()
            return None

        description = meta_text(
            'meta[property="og:description"]',
            'meta[name="twitter:description"]',
            'meta[name="description"]',
        )

        image_url = meta_url(
            'meta[property="og:image"]',
            'meta[property="og:image:url"]',
            'meta[name="twitter:image"]',
            'meta[name="twitter:image:src"]',
            'link[rel="image_src"]',
        )

        if not image_url:
            image = soup.select_one('article img, main img, .content img, img')
            if image:
                image_url = image.get('data-src') or image.get('data-lazy-src') or image.get('src')

        return {
            'summary': description,
            'image_url': normalize_url(url, image_url),
        }
    except Exception as e:
        logger.info(f"Metadata fetch skipped for {url}: {e}")
        return {}

def enrich_article(article):
    needs_summary = len(clean_text(article.get('summary')).split()) < 18
    needs_image = not is_usable_image_url(article.get('image_url')) or article.get('image_url') == PLACEHOLDER_IMAGE

    if not needs_summary and not needs_image:
        return article

    metadata = fetch_article_metadata(article['url'])
    if needs_summary and metadata.get('summary'):
        article['summary'] = structured_summary(article['title'], metadata['summary'], article['source'])
    if needs_image and metadata.get('image_url'):
        article['image_url'] = metadata['image_url']
    return article

def enrich_articles(articles):
    if not articles:
        return articles
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        return list(executor.map(enrich_article, articles))

def build_article(site, title, article_url, summary=None, image_url=None, published_at=None):
    title = clean_text(title)
    summary = clean_text(summary) or title

    if not title or len(title.split()) < 3:
        return None

    article_url = normalize_url(site['url'], article_url)
    if not article_url:
        return None

    image_url = normalize_url(article_url, image_url)
    if not is_usable_image_url(image_url):
        image_url = PLACEHOLDER_IMAGE

    return {
        'title': title,
        'summary': structured_summary(title, summary, site['name']),
        'url': article_url,
        'image_url': image_url,
        'published_at': published_at or datetime.now(UTC),
        'category': 'all',
        'source': site['name'],
        'language': site['language']
    }

def fetch_feed_news(site):
    articles = []
    seen_urls = set()

    for feed_url in site.get('feed_urls', []):
        try:
            session.headers.update({'User-Agent': get_random_user_agent()})
            response = session.get(feed_url, timeout=REQUEST_TIMEOUT, verify=True)
            response.raise_for_status()
            feed = feedparser.parse(response.content)

            if not feed.entries:
                logger.info(f"No feed entries found for {site['name']} at {feed_url}")
                continue

            for entry in feed.entries:
                if len(articles) >= ARTICLES_PER_SITE:
                    break

                article_url = getattr(entry, 'link', '')
                if not article_url or article_url in seen_urls:
                    continue

                article = build_article(
                    site=site,
                    title=getattr(entry, 'title', ''),
                    article_url=article_url,
                    summary=getattr(entry, 'summary', '') or getattr(entry, 'description', ''),
                    image_url=entry_image(entry),
                    published_at=entry_datetime(entry),
                )
                if article:
                    articles.append(article)
                    seen_urls.add(article['url'])

            if articles:
                logger.info(f"Fetched {len(articles)} feed articles from {site['name']}")
                return enrich_articles(articles)
        except Exception as e:
            logger.warning(f"Feed fetch failed for {site['name']} ({feed_url}): {e}")

    return articles

def fetch_article(url):
    """Fetch and parse a single article with site-specific cleaning."""
    try:
        # Update User-Agent for this individual article fetch
        session.headers.update({'User-Agent': get_random_user_agent()})
        
        article = Article(url)
        
        # Pass the session's downloaded HTML content to reduce blocking
        response = session.get(url, timeout=REQUEST_TIMEOUT, verify=True)
        response.raise_for_status()
        article.download(input_html=response.text)
        article.parse()
        
        # Add site-specific parsing rules
        if 'kathmandupost.com' in url:
            article.text = article.text.split('Read full story')[0]
        elif 'thehimalayantimes.com' in url:
            article.text = article.text.split('Related News')[0]
        elif 'onlinekhabar.com' in url:
            article.text = article.text.split('You might also like')[0]
        
        # Clean up common issues
        article.text = article.text.strip()
        article.text = ' '.join(article.text.split())
        
        return article
    except Exception as e:
        logger.error(f"Error fetching article {url}: {e}")
        return None

def validate_category_url(site, category):
    """Validate if a category URL exists"""
    url = f"{site['url']}{category['path']}"
    try:
        response = session.head(url, timeout=REQUEST_TIMEOUT)
        if response.status_code == 404:
            # Try alternative paths
            alternatives = [
                f"/category/{category['category'].lower()}",
                f"/categories/{category['category'].lower()}",
                f"/{category['category'].lower()}"
            ]
            for alt_path in alternatives:
                alt_url = f"{site['url']}{alt_path}"
                alt_response = session.head(alt_url, timeout=REQUEST_TIMEOUT)
                if alt_response.status_code == 200:
                    logger.info(f"Found alternative path for {category['category']}: {alt_path}")
                    category['path'] = alt_path
                    return True
            return False
        return response.status_code == 200
    except Exception as e:
        logger.warning(f"Error validating category URL {url}: {str(e)}")
        return False

def fetch_site_news(site):
    """Fetch news from a single site"""
    feed_articles = fetch_feed_news(site)
    if feed_articles:
        return feed_articles

    articles = []
    processed_urls = set()

    def build_fallback_article(title, article_url, summary=None, image_url=None):
        if not title or len(title.split()) < 4:
            return None

        article_url = normalize_url(site['url'], article_url)
        if not article_url:
            return None

        if article_url in processed_urls:
            return None

        processed_urls.add(article_url)
        image_url = normalize_url(article_url, image_url)
        if not is_usable_image_url(image_url):
            image_url = PLACEHOLDER_IMAGE

        return {
            'title': title,
            'summary': structured_summary(title, summary or title, site['name']),
            'url': article_url,
            'image_url': image_url,
            'published_at': datetime.now(UTC),
            'category': 'all',
            'source': site['name'],
            'language': site['language']
        }

    try:
        url = site['url']
        logger.info(f"Fetching news from {url}")
        
        # Small jitter is enough; long sleeps make the API feel broken.
        sleep(uniform(0.05, 0.2))
        
        # Anti-Blocking: Update User-Agent before making the request
        session.headers.update({'User-Agent': get_random_user_agent()})
        
        response = session.get(url, timeout=REQUEST_TIMEOUT, verify=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        logger.info(f"Successfully fetched HTML from {url}")
        
        # Find all articles
        news_items = soup.select(site['article_selector'])
        logger.info(f"Found {len(news_items)} articles on {url}")

        if not news_items:
            fallback_links = soup.select('a[href]')
            logger.info(f"Using fallback link extraction for {url}: {len(fallback_links)} links")

            for link in fallback_links:
                if len(articles) >= ARTICLES_PER_SITE:
                    break

                title = ' '.join(link.get_text(' ', strip=True).split())
                article_url = link.get('href', '')
                if not title or len(title) < 35:
                    continue

                parent = link.find_parent(['article', 'div', 'li']) or link.parent
                image_url = None
                if parent:
                    image_elem = parent.select_one('img')
                    if image_elem:
                        image_url = image_elem.get('data-src') or image_elem.get('src')

                article = build_fallback_article(
                    title=title,
                    article_url=article_url,
                    summary=' '.join(title.split()[:60]) + '...',
                    image_url=image_url,
                )
                if article:
                    articles.append(article)

            logger.info(f"Total articles fetched from {site['name']}: {len(articles)}")
            return enrich_articles(articles)
        
        for item in news_items[:ARTICLES_PER_SITE]:
            try:
                # Extract title and URL
                title_elem = item.select_one(site['title_selector'])
                if not title_elem:
                    logger.warning("No title element found")
                    continue
                
                title = title_elem.get_text(strip=True)
                article_url = title_elem.get('href', '')
                
                # Extract list-view image (low-priority fallback)
                list_image_url = None
                image_elem = item.select_one(site['image_selector'])
                if image_elem:
                    list_image_url = (image_elem.get('data-src') or 
                                      image_elem.get('src') or 
                                      image_elem.get('content'))
                
                # Extract summary
                summary_elem = item.select_one(site['summary_selector'])
                list_summary = summary_elem.get_text(strip=True) if summary_elem else title
                list_summary = ' '.join(list_summary.split()[:60]) + '...'
                
                article = build_fallback_article(title, article_url, list_summary, list_image_url)
                if article:
                    articles.append(article)
                    logger.info(f"Added article: {title}")
                
            except Exception as e:
                logger.warning(f"Error processing article: {str(e)}")
                continue
                
    except Exception as e:
        logger.warning(f"Error fetching from {site['name']}: {str(e)}")
    
    logger.info(f"Total articles fetched from {site['name']}: {len(articles)}")
    return enrich_articles(articles)

def parse_date(date_str):
    """Parse date string to datetime object"""
    try:
        # Add your date parsing logic here based on the format from each site
        return datetime.now(UTC) 
    except Exception:
        return datetime.now(UTC)

def clear_news_cache():
    """Clear the news cache (using standalone logic)"""
    try:
        delete_cache('all_articles_cache')
        
        for i in range(1, 11): 
            cache_key = f'news_cache_{i}'
            delete_cache(cache_key) 
            
        logger.info("News cache cleared successfully")
    except Exception as e:
        logger.error(f"Error clearing cache: {e}")

# Update the cache clearing schedule
last_cache_clear = datetime.now(UTC)

def maybe_clear_cache():
    """Check and clear cache if needed"""
    global last_cache_clear
    now = datetime.now(UTC)
    if now - last_cache_clear > timedelta(hours=1):
        clear_news_cache()
        last_cache_clear = now
        return True
    return False

def normalize_category(category):
    """Normalize category name by taking first 3 letters and lowercase"""
    return category.lower()[:3]

def categories_match(cat1, cat2):
    """Check if two categories match based on first 3 letters"""
    return normalize_category(cat1) == normalize_category(cat2)

def get_matching_category(target_category, available_categories):
    """Find matching category from available categories"""
    target_norm = normalize_category(target_category)
    for category in available_categories:
        if normalize_category(category) == target_norm:
            return category
    return None

def interleave_by_source(articles):
    """Keep articles fresh while avoiding a first page dominated by one source."""
    grouped = {}
    for article in articles:
        grouped.setdefault(article['source'], []).append(article)

    for source_articles in grouped.values():
        source_articles.sort(key=lambda x: x['published_at'], reverse=True)

    source_order = sorted(
        grouped.keys(),
        key=lambda source: grouped[source][0]['published_at'],
        reverse=True,
    )

    mixed_articles = []
    while source_order:
        next_round = []
        for source in source_order:
            source_articles = grouped[source]
            if source_articles:
                mixed_articles.append(source_articles.pop(0))
            if source_articles:
                next_round.append(source)
        source_order = next_round

    return mixed_articles

def fetch_and_summarize_news(page=1, per_page=20, language='all'):
    """Fetch and summarize news with pagination using concurrent futures."""
    try:
        per_page = max(1, min(int(per_page), 50))
        page = max(1, int(page))
        language = (language or 'all').lower()
        all_articles = get_cache('all_articles_cache')

        if all_articles is None:
            all_articles = []

            # Fetch all source homepages in parallel and paginate the cached batch.
            with concurrent.futures.ThreadPoolExecutor(max_workers=len(NEWS_SITES)) as executor:
                future_to_site = {executor.submit(fetch_site_news, site): site for site in NEWS_SITES}
                for future in concurrent.futures.as_completed(future_to_site):
                    site = future_to_site[future]
                    try:
                        all_articles.extend(future.result(timeout=REQUEST_TIMEOUT + 1))
                    except Exception as e:
                        logger.error(f"Error fetching from {site['name']} (concurrent): {str(e)}")
                        continue

            seen_urls = set()
            unique_articles = []
            for article in all_articles:
                if article['url'] not in seen_urls:
                    seen_urls.add(article['url'])
                    unique_articles.append(article)

            all_articles = interleave_by_source(unique_articles)
            set_cache('all_articles_cache', all_articles, CACHE_TIMEOUT)

        filtered_articles = all_articles
        if language in {'en', 'np'}:
            filtered_articles = [
                article for article in all_articles
                if article.get('language', 'en').lower() == language
            ]

        total_articles = len(filtered_articles)
        start_idx = (page - 1) * per_page
        end_idx = min(start_idx + per_page, total_articles)

        return {
            'articles': filtered_articles[start_idx:end_idx],
            'total': total_articles,
            'page': page,
            'per_page': per_page,
            'total_pages': math.ceil(total_articles / per_page) if total_articles else 0,
            'has_next': end_idx < total_articles
        }
            
    except Exception as e:
        logger.error(f"Error in fetch_and_summarize_news: {str(e)}")
        
    return {
        'articles': [],
        'total': 0,
        'page': page,
        'per_page': per_page,
        'total_pages': 0,
        'has_next': False
    }

def validate_site_config(site):
    """Validate and test site configuration"""
    try:
        logger.info(f"Testing configuration for {site['name']}")
        
        # Test main page first
        response = session.get(site['url'], timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Test each selector
        selectors = {
            'article': site['article_selector'],
            'title': site['title_selector'],
            'summary': site['summary_selector'],
            'image': site['image_selector'],
            'date': site['date_selector']
        }
        
        for name, selector in selectors.items():
            elements = soup.select(selector)
            logger.info(f"Found {len(elements)} {name} elements using selector: {selector}")
            
            if len(elements) == 0:
                if name == 'article':
                    alternatives = ['article', '.post', '.news-item', '.article']
                    for alt in alternatives:
                        count = len(soup.select(alt))
                        logger.info(f"Alternative '{alt}' found {count} elements")
                
        # Test a few categories
        for category in site['categories'][:2]:
            cat_url = site['url'] + category['path']
            logger.info(f"Testing category URL: {cat_url}")
            cat_response = session.get(cat_url, timeout=REQUEST_TIMEOUT)
            if cat_response.status_code != 200:
                logger.warning(f"Category {category['path']} returned status {cat_response.status_code}")
            
    except Exception as e:
        logger.error(f"Error validating site config: {str(e)}", exc_info=True)

if __name__ == '__main__':
    news_articles = fetch_and_summarize_news()
    
    # Print the articles result structure
    print(f"Total Unique Articles Found: {news_articles['total']}")
    print("-" * 30)
    for article in news_articles['articles']:
        print(f"Source: {article['source']}")
        print(f"Title: {article['title']}")
        print(f"Image URL: {article['image_url']}")
        print(f"Summary: {article['summary']}")
        print(f"URL: {article['url']}")
        print("-" * 30)

    # Example of running the validator
    for site in NEWS_SITES:
        if site['name'] == 'The Himalayan Times':
            validate_site_config(site)
