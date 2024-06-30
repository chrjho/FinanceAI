from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

# Create your views here.
def stocks(request):
    return HttpResponse("Hello, this is the stock page")

def currentStocks(request):
    template = loader.get_template("currentStocks.html")
    return HttpResponse(template.render())