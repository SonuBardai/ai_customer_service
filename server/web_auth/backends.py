from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Custom authentication backend to allow users to authenticate with email
    """
    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            # Try to find a user matching the provided email
            user = User.objects.get(email=email)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            # No user was found with this email
            return None
        
        # Wrong password
        return None
