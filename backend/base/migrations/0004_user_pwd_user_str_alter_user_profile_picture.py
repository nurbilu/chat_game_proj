# Generated by Django 4.1.13 on 2024-07-26 03:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0003_alter_user_profile_picture'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='pwd_user_str',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='profile_picture',
            field=models.ImageField(blank=True, default='media/profile_pictures/no_profile_pic.png', null=True, upload_to='profile_pictures/'),
        ),
    ]
