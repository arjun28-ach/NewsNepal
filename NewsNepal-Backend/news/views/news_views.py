from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST, require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils import timezone
from ..models import UserBookmark
from ..scraper import fetch_and_summarize_news, maybe_clear_cache
import json
import logging

logger = logging.getLogger(__name__)

@ensure_csrf_cookie
def home(request):
    return render(request, 'index.html')

@ensure_csrf_cookie
def news_api(request):
    try:
        page = int(request.GET.get('page', 1))
        per_page = min(int(request.GET.get('per_page', 20)), 50)
        language = request.GET.get('language', 'all')
        
        maybe_clear_cache()
        news_data = fetch_and_summarize_news(page=page, per_page=per_page, language=language)
        
        return JsonResponse(news_data)
    except ValueError as e:
        logger.error(f"Invalid parameters: {e}")
        return JsonResponse({
            'error': 'Invalid parameters provided'
        }, status=400)
    except Exception as e:
        logger.error(f"Error in news_api: {e}")
        return JsonResponse({
            'error': str(e)
        }, status=500)

@login_required
@require_POST
def bookmark_article(request):
    try:
        data = json.loads(request.body)
        article_url = data.get('article_url') or data.get('url')
        if not article_url:
            return JsonResponse({'status': 'error', 'message': 'Article URL is required'}, status=400)

        UserBookmark.objects.update_or_create(
            user=request.user,
            article_url=article_url,
            defaults={
                'title': data.get('title', ''),
                'summary': data.get('summary', ''),
                'image_url': data.get('image_url') or 'https://via.placeholder.com/400x300?text=News+Image',
                'published_at': data.get('published_at') or timezone.now(),
                'category': data.get('category', 'all'),
                'source': data.get('source', 'Unknown'),
                'language': data.get('language', 'en'),
            }
        )
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@login_required
def get_bookmarks(request):
    bookmarks = UserBookmark.objects.filter(user=request.user).order_by('-created_at')
    return JsonResponse({
        'bookmarks': list(bookmarks.values())
    })

@login_required
def get_bookmark_count(request):
    count = UserBookmark.objects.filter(user=request.user).count()
    return JsonResponse({'count': count})

@login_required
@require_http_methods(["POST", "DELETE"])
def remove_bookmark(request):
    try:
        data = json.loads(request.body or '{}')
        article_url = data.get('article_url') or data.get('url')
        if not article_url:
            return JsonResponse({'status': 'error', 'message': 'Article URL is required'}, status=400)

        deleted, _ = UserBookmark.objects.filter(
            user=request.user,
            article_url=article_url
        ).delete()

        if deleted:
            return JsonResponse({'status': 'success'})
        return JsonResponse({'status': 'error', 'message': 'Bookmark not found'}, status=404)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
