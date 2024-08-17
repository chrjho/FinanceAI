from django.http import JsonResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken
import json
import requests

@csrf_exempt
def signup(request):
    if request.method == "POST":
        reqJson = json.loads(request.body)
        
        email = reqJson.get("emailInput")
        username = reqJson.get("usernameInput")  # Assuming you added username in the model
        password = reqJson.get("passwordInput")
        confirm = reqJson.get("confirmInput")

        if not email or not username or not password or not confirm:
            return JsonResponse({"error": "Missing required fields"}, status=400)
        
        if password != confirm:
            return JsonResponse({"error": "Passwords do not match"}, status=400)

        try:
            user = CustomUser.objects.create_user(email=email, username=username, password=password)
            return JsonResponse({"message": "User created successfully"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)

@csrf_exempt
def login(request):
    if request.method == "POST":
        reqJson = json.loads(request.body)
        
        username = reqJson.get("usernameInput")
        password = reqJson.get("passwordInput")

        if not username or not password:
            return JsonResponse({"error": "Missing required fields"}, status=400)

        try:
            # Retrieve the user by email (or any other unique identifier)
            user = CustomUser.objects.get(username=username)
            
            # Use the check_password method to verify the password
            if user.check_password(password):
                # Get JWT and pass to client thru header
                payload = dict(username=username, password=password)
                jwtResponse = requests.post("https://127.0.0.1:8000/api/token/",data = payload,verify=False)
                if jwtResponse.status_code == 200:
                    tokens = jwtResponse.json()
                    accessToken = tokens.get("access")
                    refreshToken = tokens.get("refresh")
                    response = JsonResponse({"message": "Login successful!"}, status=201)
                    response["Authorization"] = "Bearer " + accessToken
                    response["X-Refresh"] = "Bearer " + refreshToken
                    response["Access-Control-Expose-Headers"] = "Authorization, X-Refresh, Set-Cookie"

                    response["Access-Control-Allow-Credentials"] = True
                    response.set_cookie("refresh", refreshToken,httponly=True,path='/',secure=True,samesite="None")
                    return response
                else:
                    return JsonResponse({"error": "Could not fetch JWT please try again"}, status=400)
            else:
                return False
        except CustomUser.DoesNotExist:
            # Handle the case where the user does not exist
            return JsonResponse({"error": "Incorrect username or password"}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405)