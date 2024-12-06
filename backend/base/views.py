from django.contrib.auth import authenticate, login, update_session_auth_hash  # Ensure this import is added
from rest_framework import permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated , IsAdminUser
from .serializers import UserRegisterSerializer, MyTokenObtainPairSerializer, UserProfileSerializer, ChangePasswordSerializer, ValidateUserSerializer, ResetPasswordSerializer, CreateSuperUserSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
import logging
from django.http import JsonResponse, Http404
from .utils import get_gemini_response
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser  # Add JSONParser
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User 
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.core.mail import get_connection
User = get_user_model()
logger = logging.getLogger(__name__)

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, username=None):
        if request.user.is_superuser:
            if username:
                try:
                    user = User.objects.get(username=username)
                    serializer = UserProfileSerializer(user)
                    return Response(serializer.data)
                except User.DoesNotExist:
                    return Response({"error": "User not found"}, status=404)
            else:
                users = User.objects.all()
                serializer = UserProfileSerializer(users, many=True)
                return Response(serializer.data)
        else:
            if username and username != request.user.username:
                return Response({"error": "Unauthorized"}, status=403)
            user = request.user
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'User registered successfully'
            }, status=201)
        return Response(serializer.errors, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(APIView):
    def put(self, request, *args, **kwargs):
        logger.debug(f"Received data: {request.data}")
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_new_password = request.data.get('confirm_new_password')

        if not user.check_password(old_password):
            return Response({'error': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_new_password:
            return Response({'error': 'New passwords must match.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.pwd_user_str = new_password  # Update the pwd_user_str field
        user.save()
        update_session_auth_hash(request, user)  # Important to keep the user logged in after password change
        return Response({'success': 'Password updated successfully.'}, status=status.HTTP_200_OK)

class SuperUserProfileView(APIView):
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Accessed by user: {request.user.username}")
        if not request.user.is_superuser:
            logger.warning("Unauthorized access attempt.")
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        users = User.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return JsonResponse(serializer.data, safe=False)

class ProfilePictureUploadView(APIView):
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        file = request.FILES.get('profile_picture')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.profile_picture = file
        user.save()
        return Response({'profile_picture': user.profile_picture.url}, status=status.HTTP_200_OK)
    
    def put(self, request):
        user = request.user
        file = request.FILES.get('profile_picture')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.profile_picture = file
        user.save()
        return Response({'profile_picture': user.profile_picture.url}, status=status.HTTP_200_OK)

class UserProfileUpdateView(APIView):
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request):
        user = request.user
        logger.debug(f"Received data: {request.data}")
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.debug(f"Updated user: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.debug(f"Errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ValidateUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ValidateUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(
                    username=serializer.validated_data['username'],
                    email=serializer.validated_data['email'],
                    first_name=serializer.validated_data['firstName'],
                    last_name=serializer.validated_data['lastName']
                )
                
                # Create a special reset token using JWT
                refresh = RefreshToken.for_user(user)
                
                # Add custom claims
                refresh['token_type'] = 'reset'  # Add token type
                refresh['email'] = user.email
                refresh['username'] = user.username
                
                access_token = str(refresh.access_token)
                
                return Response({
                    'token': access_token,
                    'user': {
                        'username': user.username,
                        'email': user.email
                    }
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                # For security, don't reveal if user exists
                return Response({
                    'error': 'Invalid user information'
                }, status=status.HTTP_404_NOT_FOUND)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def put(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Get token from Authorization header
                auth_header = request.headers.get('Authorization')
                if not auth_header or not auth_header.startswith('Bearer '):
                    return Response(
                        {'error': 'Invalid token format'}, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                token = auth_header.split(' ')[1]
                # Decode token to get user
                try:
                    decoded_token = AccessToken(token)
                    user = User.objects.get(id=decoded_token['user_id'])
                except (InvalidToken, User.DoesNotExist):
                    return Response(
                        {'error': 'Invalid or expired token'}, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )

                # Update password
                new_password = serializer.validated_data.get('new_password')
                user.set_password(new_password)
                user.pwd_user_str = new_password  # Update the plain text password field
                user.save()

                return Response(
                    {'success': 'Password reset successfully'}, 
                    status=status.HTTP_200_OK
                )
                
            except Exception as e:
                logger.error(f"Error resetting password: {str(e)}")
                return Response(
                    {'error': 'Server error occurred'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateSuperUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = CreateSuperUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'Superuser created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BlockUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
            user.is_blocked = True
            user.save()
            return Response({
                'message': 'User blocked successfully',
                'is_blocked': True
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class UnblockUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
            user.is_blocked = False
            user.save()
            return Response({
                'message': 'User unblocked successfully',
                'is_blocked': False
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile_picture = '/super-user-pic/Super-Pic.png' if user.is_superuser else (
            user.profile_picture.url if user.profile_picture else '/profile_pictures/default.png'
        )
        
        return Response({
            'username': user.username,
            'email': user.email,
            'is_blocked': user.is_blocked,
            'profile_picture': profile_picture
        })

class DeleteUserView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request):
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
            user.delete()
            return Response({
                'message': 'User deleted successfully'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class SendPasswordResetEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email, username=username)
            token = RefreshToken.for_user(user)
            
            try:
                reset_url = f"http://localhost:4200/reset-pwd?token={str(token)}"
                
                # Test connection first with detailed error logging
                connection = get_connection(
                    host=settings.EMAIL_HOST,
                    port=settings.EMAIL_PORT,
                    username=settings.EMAIL_HOST_USER,
                    password=settings.EMAIL_HOST_PASSWORD,
                    use_tls=settings.EMAIL_USE_TLS
                )
                
                try:
                    connection.open()
                    logger.info("SMTP connection successful")
                except Exception as conn_error:
                    logger.error(f"SMTP connection error details: {str(conn_error)}")
                    return Response({
                        'error': 'Failed to connect to email server. Please try again later.',
                        'details': str(conn_error)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
                # Add more detailed logging
                logger.info(f"Starting email send process to {email}")
                logger.info(f"Using email configuration: HOST={settings.EMAIL_HOST}, PORT={settings.EMAIL_PORT}")
                
                html_message = render_to_string('registration/reset_password_email.html', {
                    'user': user,
                    'reset_url': reset_url
                })
                
                plain_message = strip_tags(html_message)
                
                send_mail(
                    subject='Password Reset Request',
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    html_message=html_message,
                    fail_silently=False,
                    connection=connection
                )
                
                logger.info(f"Password reset email sent successfully to {email}")
                return Response({
                    'message': 'Password reset email sent successfully'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                logger.error(f"Error sending email to {email}: {str(e)}")
                return Response({
                    'error': f'Failed to send email: {str(e)}',
                    'email_settings': {
                        'host': settings.EMAIL_HOST,
                        'port': settings.EMAIL_PORT,
                        'use_tls': settings.EMAIL_USE_TLS,
                        'from_email': settings.DEFAULT_FROM_EMAIL,
                        'username': settings.EMAIL_HOST_USER,
                    }
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except User.DoesNotExist:
            # Security through obscurity - don't reveal if email exists
            return Response({
                'message': 'If a user with this email exists, a password reset link has been sent'
            }, status=status.HTTP_200_OK)
