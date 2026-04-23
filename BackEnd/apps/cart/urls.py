from django.urls import path

from .views import CartItemCreateAPIView, CartItemDetailAPIView, CartMeAPIView

app_name = "api_cart"

urlpatterns = [
    path("me/", CartMeAPIView.as_view(), name="cart-me"),
    path("items/", CartItemCreateAPIView.as_view(), name="cart-item-add"),
    path("items/<int:item_id>/", CartItemDetailAPIView.as_view(), name="cart-item-detail"),
]
