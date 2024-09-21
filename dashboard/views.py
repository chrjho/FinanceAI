from django.db import connection
from django.http import HttpResponse
from rest_framework_simplejwt.tokens import AccessToken
import json

# Create your views here.
def loadDashboard(request):
    if request.method == "GET":
        accessToken = AccessToken(request.headers.get("Authorization"))
        userId = accessToken.get("user_id").replace("-","")

        with connection.cursor() as cursor:
            outParam = cursor.var(str).var
            try:
                cursor.callproc("LOADDASHBOARD", [userId, outParam])
                return HttpResponse(outParam.getvalue())
            except:
                return HttpResponse("No data found", status=404)

def saveToDashboard(request):
    if request.method == "POST":
        accessToken = AccessToken(request.headers.get("Authorization"))
        userId = accessToken.get("user_id").replace("-","")

        reqJson = json.loads(request.body)
        chartConfigs = json.dumps(reqJson)
        insertDashboard(userId, chartConfigs)

    return HttpResponse("done")

def insertDashboard(userId, chartConfigs):
    with connection.cursor() as cursor:
        cursor.callproc("INSERTDASHBOARD", [str(userId), str(chartConfigs)])

def removePanel(request):
    if request.method == "POST":
        accessToken = AccessToken(request.headers.get("Authorization"))
        userId = accessToken.get("user_id").replace("-","")

        reqJson = json.loads(request.body)
        chartConfig = json.dumps(reqJson)

        with connection.cursor() as cursor:
            try:
                cursor.callproc("REMOVEPANEL", [userId, chartConfig])
                return HttpResponse("Panel removed")
            except:
                return HttpResponse("No data found", status=404)
