# Generated by Django 4.1.13 on 2024-07-21 07:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0002_user_profile_picture'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='profile_picture',
            field=models.ImageField(blank=True, default='profile_pictures/no_profile_pic.png', null=True, upload_to='profile_pictures/'),
        ),
    ]