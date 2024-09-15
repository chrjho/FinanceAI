from django.http import HttpResponse, JsonResponse

import yfinance
import plotly.express as px
import json


# Create your views here.
def stocks(request):
    jsonData = ""
    if request.method == "POST":
        reqJson = json.loads(request.body)
        tickerSymbol = reqJson.get("tickerSymbol")
        timePeriod = reqJson.get("timePeriod")
        timeInterval = reqJson.get("timeInterval")
        
        ticker = yfinance.Ticker(tickerSymbol)
        data = ticker.history(period = timePeriod, interval = timeInterval)
        data = data.reset_index()

        if 'Datetime' in data.columns:
            dateCol = 'Datetime'
        else:
            dateCol = 'Date'

        jsonData = {
            "dates": data[dateCol].astype(str).tolist(),
            "open": data['Open'].tolist(),
            "high": data['High'].tolist(),
            "low": data['Low'].tolist(),
            "close": data['Close'].tolist(),
        }
        return JsonResponse(jsonData)
    else:
        return HttpResponse("no")