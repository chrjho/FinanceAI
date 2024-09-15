from django.core import serializers
from django.http import HttpResponse, JsonResponse
from django.db import connection
from FinanceAI import version
from FinanceAI.utils import jsonHelper
from .models import Health, HealthSerializer

# Create your views here.
def monitor(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM TESTCONN")
            rows = cursor.fetchall()
            if rows:
                # Process the rows
                row = rows[0]
                health = Health(version=version.__version__, status = row[0])
                healthJson = jsonHelper.Serializer(health, model=Health, fields=['version','status'])
                return JsonResponse(healthJson.data, safe=False)
            else:
                # Handle case where no rows are fetched
                return HttpResponse("Unable to connect to Oracle Database")
    except Exception as e:
        return HttpResponse(str(e))
