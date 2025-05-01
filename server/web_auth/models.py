from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin


class User(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_set",  # Custom related name to avoid clashes
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_set",  # Custom related name to avoid clashes
        blank=True,
    )

    # USERNAME_FIELD = "..."
    # REQUIRED_FIELDS = []

    class Meta:
        db_table = "users"
