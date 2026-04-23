from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("line_total",)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "payment_method", "total_amount", "created_at")
    list_filter = ("status", "payment_method")
    inlines = [OrderItemInline]
    search_fields = ("shipping_full_name", "shipping_phone", "user__email")
