from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.management import call_command

User = get_user_model()

class Command(BaseCommand):
    help = 'Initialize database with required data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Running migrations...')
        call_command('migrate')

        if not User.objects.filter(username='haga').exists():
            self.stdout.write('Creating superuser...')
            User.objects.create_superuser(
                username='haga',
                email='haga@gmail.com',
                password='haga123456789'
            )
            self.stdout.write(self.style.SUCCESS('Superuser created successfully'))

        self.stdout.write(self.style.SUCCESS('Database initialization completed')) 