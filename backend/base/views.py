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
        user.save(update_fields=['profile_picture'])  # Only update the profile_picture field
        return Response({'profile_picture': user.profile_picture.url}, status=status.HTTP_200_OK)
    
    def put(self, request):
        user = request.user
        file = request.FILES.get('profile_picture')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.profile_picture = file
        user.save(update_fields=['profile_picture'])  # Only update the profile_picture field
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
            username = serializer.validated_data.get('username')
            email = serializer.validated_data.get('email')
            try:
                user = User.objects.get(username=username, email=email)
                token = RefreshToken.for_user(user)
                return Response({'token': str(token)}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({'error': 'Invalid username or email'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def put(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            try:
                token = request.headers.get('Authorization').split(' ')[1]
                user = User.objects.get(id=AccessToken(token).payload['user_id'])  # Use AccessToken instead of RefreshToken
                new_password = serializer.validated_data.get('new_password')
                confirm_new_password = serializer.validated_data.get('confirm_new_password')

                if new_password != confirm_new_password:
                    return Response({'error': 'New passwords must match.'}, status=status.HTTP_400_BAD_REQUEST)

                user.set_password(new_password)
                user.pwd_user_str = new_password
                user.save()
                return Response({'success': 'Password reset successfully.'}, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Error resetting password: {str(e)}")
                return Response({'error': 'Server error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateSuperUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = CreateSuperUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'Superuser created successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

