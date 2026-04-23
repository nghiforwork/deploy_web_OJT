from django.urls import path

from .views import OrderCancelAPIView, OrderCheckoutAPIView, OrderDetailAPIView, OrderListAPIView

urlpatterns = [
    path("checkout/", OrderCheckoutAPIView.as_view(), name="order-checkout"),
    path("", OrderListAPIView.as_view(), name="order-list"),
    path("<int:pk>/", OrderDetailAPIView.as_view(), name="order-detail"),
    path("<int:pk>/cancel/", OrderCancelAPIView.as_view(), name="order-cancel"),
]
