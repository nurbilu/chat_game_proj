from django.urls import path
from .views import UserRegisterView, MyTokenObtainPairView, UserProfileView , RegisterView, chat_response

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/<str:username>/', UserProfileView.as_view(), name='user-profile-specific'),
    path('chat/', chat_response, name='chat-response'),
]
