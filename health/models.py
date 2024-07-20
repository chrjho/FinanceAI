from django.db import models
from rest_framework import serializers

# Create your models here.
class Health(models.Model):
    version = models.CharField(max_length=8)
    status = models.CharField(max_length=100)

class HealthSerializer(serializers.ModelSerializer):
    class Meta:
        model = Health
        fields = ['version','status']