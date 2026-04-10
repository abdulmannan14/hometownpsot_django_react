from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_GUEST = "guest"
    ROLE_USER = "user"
    ROLE_ADMIN = "admin"

    ROLE_CHOICES = [
        (ROLE_GUEST, "Guest"),
        (ROLE_USER, "User"),
        (ROLE_ADMIN, "Admin"),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_USER)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    city = models.CharField(max_length=100, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username
