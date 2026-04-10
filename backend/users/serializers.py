from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "password2", "city", "latitude", "longitude"]
        extra_kwargs = {
            "city": {"required": False},
            "latitude": {"required": False},
            "longitude": {"required": False},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            city=validated_data.get("city", ""),
            latitude=validated_data.get("latitude"),
            longitude=validated_data.get("longitude"),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "is_staff", "bio", "avatar", "date_joined", "city", "latitude", "longitude"]
        read_only_fields = ["id", "email", "role", "is_staff", "date_joined"]


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
