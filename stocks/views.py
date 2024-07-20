from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.db import connection

import yfinance

# Create your views here.
def stocks(request):

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM TESTCONN")
            rows = cursor.fetchall()
            if rows:
                # Process the rows (example: returning the first row)
                row = rows[0]
                return HttpResponse(row)
            else:
                # Handle case where no rows are fetched
                return HttpResponse("No data found")
    except Exception as e:
        return HttpResponse(str(e))

def currentStocks(request):
    ticker = yfinance.Ticker("AAPL")
    todaysData = ticker.history(period = "1d")
    # template = loader.get_template("currentStocks.html")
    return HttpResponse(todaysData["Close"])