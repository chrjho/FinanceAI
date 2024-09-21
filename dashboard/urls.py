from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.loadDashboard, name="load"),
    path("dashboard/save", views.saveToDashboard, name="save"),
    path("dashboard/remove", views.removePanel, name="remove")
]
