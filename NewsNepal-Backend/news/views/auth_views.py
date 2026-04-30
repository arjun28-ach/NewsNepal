from django.http import JsonResponse
from django.contrib.auth import login, logout, authenticate, get_user_model, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_POST
from django.middleware.csrf import get_token
import json
import logging

logger = logging.getLogger(__name__)

@ensure_csrf_cookie
def get_csrf_token(request):
    """Get CSRF token for frontend"""
    return JsonResponse({'csrfToken': get_token(request)})

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email') or data.get('username')
            password = data.get('password')
            name = data.get('name') or email
            
            # Validate input
            if not email or not password:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Email and password are required'
                }, status=400)
            
            User = get_user_model()
            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'status': 'error',
                    'message': 'Email already exists'
                }, status=400)
            
            user = User.objects.create_user(
                email=email,
                password=password,
                name=name,
                username=email,
            )
            login(request, user)
            return JsonResponse({
                'status': 'success',
                'user': {
                    'email': user.email,
                    'name': user.name,
                }
            })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in signup: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'An unexpected error occurred'
            }, status=500)
            
    return JsonResponse({
        'status': 'error',
        'message': 'Method not allowed'
    }, status=405)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('email') or data.get('username')
            password = data.get('password')
            
            # Validate input
            if not username or not password:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Username and password are required'
                }, status=400)
            
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'status': 'success',
                    'user': {
                        'email': user.email,
                        'name': user.name,
                    }
                })
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid credentials'
            }, status=400)
        except json.JSONDecodeError:
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            logger.error(f"Unexpected error in login: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'An unexpected error occurred'
            }, status=500)
            
    return JsonResponse({
        'status': 'error',
        'message': 'Method not allowed'
    }, status=405)

def logout_view(request):
    logout(request)
    return JsonResponse({'status': 'success'})

@ensure_csrf_cookie
def auth_status(request):
    return JsonResponse({
        'isAuthenticated': request.user.is_authenticated,
        'user': {
            'email': request.user.email,
            'name': request.user.name,
        } if request.user.is_authenticated else None
    })

@login_required
@require_POST
def change_password(request):
    try:
        data = json.loads(request.body)
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return JsonResponse({'status': 'error', 'message': 'Both passwords are required'}, status=400)

        if not request.user.check_password(current_password):
            return JsonResponse({'status': 'error', 'message': 'Current password is incorrect'}, status=400)

        request.user.set_password(new_password)
        request.user.save(update_fields=['password'])
        update_session_auth_hash(request, request.user)
        return JsonResponse({'status': 'success'})
    except Exception as e:
        logger.error(f"Unexpected error in change_password: {str(e)}")
        return JsonResponse({'status': 'error', 'message': 'Unable to change password'}, status=500)

@login_required
@require_POST
def delete_account(request):
    request.user.delete()
    logout(request)
    return JsonResponse({'status': 'success'})

@require_POST
def forgot_password(request):
    return JsonResponse({
        'status': 'error',
        'message': 'Password reset email is not configured yet'
    }, status=501)
