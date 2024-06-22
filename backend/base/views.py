from django.contrib.auth import authenticate, login
from rest_framework import permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserRegisterSerializer, MyTokenObtainPairSerializer, UserProfileSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
import logging
from django.http import JsonResponse
from .utils import get_gemini_response

User = get_user_model()

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_superuser:
            # Return all user profiles for superusers
            users = User.objects.all()
            serializer = UserProfileSerializer(users, many=True)
            return Response(serializer.data)
        else:
            # Return the profile of the requesting user
            try:
                user_profile = User.objects.get(username=request.user.username)
                serializer = UserProfileSerializer(user_profile)
                return Response(serializer.data)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logging.error(f"Error retrieving user profile: {str(e)}")
                return Response({"error": "Internal Server Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return Response({'message': 'User logged in successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    permission_classes = [AllowAny]  # Allow unauthenticated users

    def post(self, request, *args, **kwargs):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=201)
        return Response(serializer.errors, status=400)

def chat_response(request):
    prompt = request.GET.get('prompt')
    response = get_gemini_response(prompt)
    if 'error' in response:
        return JsonResponse({'error': response['error'], 'details': response.get('details')}, status=500)
    return JsonResponse(response)
