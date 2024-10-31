from django.db import models
from django.contrib.auth.models import AbstractUser
import datetime

class User(AbstractUser):
    password = models.TextField()
    email = models.EmailField(unique=True)
    address = models.CharField(max_length=255, blank=True, null=True) 
    birthdate = models.DateField(default=datetime.date.today)
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="custom_user_groups",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="custom_user_permissions",
        related_query_name="user",
    )
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True, default='media/default-prfle-pic/no_profile_pic.png')
    pwd_user_str = models.CharField(max_length=128, blank=True, null=True)
    is_blocked = models.BooleanField(default=False)
