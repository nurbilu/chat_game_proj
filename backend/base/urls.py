from django.urls import path
from .views import UserRegisterView, MyTokenObtainPairView, UserProfileView, RegisterView, ChangePasswordView, SuperUserProfileView, ProfilePictureUploadView, UserProfileUpdateView, ValidateUserView, ResetPasswordView, CreateSuperUserView, CustomTokenRefreshView, BlockUserView, UnblockUserView, CurrentUserView, DeleteUserView, SendPasswordResetEmailView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/<str:username>/', UserProfileView.as_view(), name='user-profile-specific'),
    path('superuser/', SuperUserProfileView.as_view(), name='superuser-profiles'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('upload-profile-picture/', ProfilePictureUploadView.as_view(), name='upload-profile-picture'),
    path('person/data/update/', UserProfileUpdateView.as_view(), name='profile-update'),
    path('validate-user/', ValidateUserView.as_view(), name='validate_user'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('create-superuser/', CreateSuperUserView.as_view(), name='create-superuser'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('block-user/', BlockUserView.as_view(), name='block-user'),
    path('unblock-user/', UnblockUserView.as_view(), name='unblock-user'),
    path('current-user/', CurrentUserView.as_view(), name='current-user'),
    path('delete-user/', DeleteUserView.as_view(), name='delete-user'),
    path('send-reset-email/', SendPasswordResetEmailView.as_view(), name='send-reset-email'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
