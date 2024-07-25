from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Convert date to string in ISO format
        token['username'] = user.username
        token['email'] = user.email
        token['address'] = user.address
        token['birthdate'] = user.birthdate.isoformat() if user.birthdate else None
        token['profile_picture'] = user.profile_picture.url if user.profile_picture else 'profile_pictures/no_profile_pic.png'
        return token

class UserRegisterSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'address', 'birthdate', 'password', 'profile_picture']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_picture = validated_data.pop('profile_picture', None)
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            address=validated_data.get('address', ''),
            birthdate=validated_data.get('birthdate')
        )
        user.set_password(validated_data['password'])
        if profile_picture:
            user.profile_picture = profile_picture
        user.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'address', 'birthdate', 'profile_picture']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"confirm_new_password": "New Password and Confirm New Password do not match"})
        return data