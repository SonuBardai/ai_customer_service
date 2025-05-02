from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from core.storage import MediaStorage
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Custom User model that extends Django's AbstractUser
    and adds a relationship to Company"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    company = models.ForeignKey(
        'company.Company',
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True
    )
    profile_picture = models.ImageField(
        storage=MediaStorage(),
        upload_to='profile_pictures/',
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
