from django.urls import path
from .views import UserRegisterView, MyTokenObtainPairView, UserProfileView, RegisterView, ChangePasswordView, SuperUserProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/<str:username>/', UserProfileView.as_view(), name='user-profile-specific'),
    path('profile/superuser/', SuperUserProfileView.as_view(), name='superuser-profiles'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]