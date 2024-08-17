from django.urls import path
from . import views

urlpatterns = [
    path('user/signup/', views.signup, name="signup"),
    path('user/login/', views.login, name="login")
]