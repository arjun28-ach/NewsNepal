# urls.py

from django.urls import path
from .views import auth_views, news_views

urlpatterns = [
    # News endpoints
    path('news/', news_views.news_api, name='news_api'),

    # Bookmark endpoints used by the React app
    path('bookmarks/', news_views.get_bookmarks, name='bookmarks'),
    path('bookmarks/add/', news_views.bookmark_article, name='bookmark_add'),
    path('bookmarks/remove/', news_views.remove_bookmark, name='bookmark_remove'),
    path('bookmarks/count/', news_views.get_bookmark_count, name='bookmark_count'),

    # Backwards-compatible bookmark endpoints
    path('news/bookmarks/', news_views.get_bookmarks, name='get_bookmarks'),
    path('news/bookmark/', news_views.bookmark_article, name='bookmark_article'),
    path('news/bookmark-count/', news_views.get_bookmark_count, name='get_bookmark_count'),
    
    # Auth endpoints
    path('csrf/', auth_views.get_csrf_token, name='csrf'),
    path('accounts/signup/', auth_views.signup, name='signup'),
    path('accounts/login/', auth_views.login_view, name='login'),
    path('accounts/logout/', auth_views.logout_view, name='logout'),
    path('accounts/status/', auth_views.auth_status, name='auth_status'),
    path('accounts/change-password/', auth_views.change_password, name='change_password'),
    path('accounts/delete/', auth_views.delete_account, name='delete_account'),
    path('accounts/forgot-password/', auth_views.forgot_password, name='forgot_password'),
]
