import os
import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.products.models import Product
from apps.orders.models import Order
from apps.designs.models import CustomDesign

client = APIClient()

def test_suite():
    print("============================================================")
    print("🧪 Running KAYA Full Suite Extended Verification")
    print("============================================================")

    passed = 0
    failed = 0

    def assert_eq(cond, desc):
        nonlocal passed, failed
        if cond:
            print(f"  ✅ {desc}")
            passed += 1
        else:
            print(f"  ❌ FAILED: {desc}")
            failed += 1

    # 1. Health check
    res = client.get('/api/health')
    assert_eq(res.status_code == 200 and res.json().get('status') == 'ok', 'GET /api/health -> 200 OK')

    # 2. Unknown API 404
    res = client.get('/api/unknown-endpoint-test')
    assert_eq(res.status_code == 404 and 'not found' in res.json().get('message', ''), 'GET /api/unknown -> JSON 404')

    # 3. Customer login
    res = client.post('/api/auth/login', {'email': 'dasettisaikumar@gmail.com', 'password': 'password123'}, format='json')
    customer_token = res.json().get('token')
    assert_eq(res.status_code == 200 and customer_token is not None, 'POST /api/auth/login (Customer) -> 200 with JWT')

    # 4. Admin login
    res = client.post('/api/auth/login', {'email': 'nandinigottipati2004@gmail.com', 'password': 'Nandhini@2004'}, format='json')
    admin_token = res.json().get('token')
    admin_user = res.json().get('user')
    assert_eq(res.status_code == 200 and admin_token is not None and admin_user.get('is_admin') is True, 'POST /api/auth/login (Admin) -> 200 with Admin Privileges')

    # 5. GET /api/auth/me with Customer Token
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
    res = client.get('/api/auth/me')
    assert_eq(res.status_code == 200 and res.json().get('user', {}).get('email') == 'dasettisaikumar@gmail.com', 'GET /api/auth/me (Authenticated) -> 200')

    # 6. GET /api/auth/details
    res = client.get('/api/auth/details')
    assert_eq(res.status_code == 200 and 'details' in res.json(), 'GET /api/auth/details -> 200 with details')

    # 7. GET /api/products (Public)
    client.credentials() # clear credentials
    res = client.get('/api/products')
    prods = res.json().get('data', [])
    assert_eq(res.status_code == 200 and len(prods) > 0, f'GET /api/products -> 200 with {len(prods)} products')

    # 8. GET /api/products/:id
    first_prod = prods[0]
    first_id = first_prod.get('id')
    res = client.get(f'/api/products/{first_id}')
    assert_eq(res.status_code == 200 and res.json().get('data', {}).get('name') == first_prod.get('name'), f'GET /api/products/{first_id} -> 200 matching product')

    # 9. GET /api/products/all (Protected Admin)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    res = client.get('/api/products/all')
    assert_eq(res.status_code == 200 and len(res.json().get('data', [])) >= len(prods), 'GET /api/products/all (Admin) -> 200 with all products')

    # 10. POST /api/designs (Save custom design)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {customer_token}')
    design_payload = {
        'product_id': first_id,
        'design_json': {'color': '#064e3b', 'size': 'A3', 'scale': 100, 'frame_style': 'oak'}
    }
    res = client.post('/api/designs', design_payload, format='json')
    design_id = res.json().get('design_id')
    assert_eq(res.status_code == 201 and design_id is not None, f'POST /api/designs -> 201 Created (design_id: {design_id})')

    # 11. GET /api/designs/:id
    res = client.get(f'/api/designs/{design_id}')
    assert_eq(res.status_code == 200 and res.json().get('data', {}).get('product') is not None, f'GET /api/designs/{design_id} -> 200 with populated product')

    # 12. POST /api/orders (Order custom design)
    order_payload = {
        'custom_design_id': design_id,
        'shipping_address': 'Flat 402, Signature Towers, Jubilee Hills, Hyderabad',
        'customer_name': 'Dasetti Sai Kumar',
        'customer_phone': '+919059245025',
        'customer_email': 'dasettisaikumar@gmail.com',
        'payment_id': 'PAY-TEST-MIGRATION-12345',
    }
    res = client.post('/api/orders', order_payload, format='json')
    order_id = res.json().get('order_id')
    order_num = res.json().get('order_number')
    assert_eq(res.status_code == 201 and order_num is not None, f'POST /api/orders -> 201 Created (Order #{order_num})')

    # 13. POST /api/orders/cart-checkout (Cart order)
    cart_payload = {
        'cart_items': [{'product_id': first_id, 'name': first_prod.get('name'), 'price': 3499, 'quantity': 1}],
        'total_price': 4128.82,
        'shipping_address': 'Flat 402, Signature Towers, Hyderabad',
        'customer_name': 'Dasetti Sai Kumar',
        'customer_phone': '+919059245025',
        'customer_email': 'dasettisaikumar@gmail.com',
        'payment_id': 'PAY-CART-TEST-67890',
    }
    res = client.post('/api/orders/cart-checkout', cart_payload, format='json')
    cart_order_id = res.json().get('order_id')
    assert_eq(res.status_code == 201 and cart_order_id is not None, f'POST /api/orders/cart-checkout -> 201 Created')

    # 14. Customer cancel order
    res = client.patch(f'/api/orders/{cart_order_id}/cancel')
    assert_eq(res.status_code == 200 and res.json().get('data', {}).get('status') == 'cancelled', f'PATCH /api/orders/{cart_order_id}/cancel -> 200 Cancelled')

    # 15. Admin update order status
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    res = client.patch(f'/api/admin/orders/{order_id}/status', {'status': 'processing'}, format='json')
    assert_eq(res.status_code == 200 and res.json().get('data', {}).get('status') == 'processing', f'PATCH /api/admin/orders/{order_id}/status -> 200 Processing')

    # 16. Admin dashboard
    res = client.get('/api/admin/dashboard')
    dash = res.json()
    assert_eq(res.status_code == 200 and 'stats' in dash and 'users' in dash and 'orders' in dash, 'GET /api/admin/dashboard -> 200 with full stats')

    # 17. AI Generate Art Spec
    client.credentials()
    res = client.post('/api/ai/generate-art', {'prompt': 'modern minimalist geometric'}, format='json')
    assert_eq(res.status_code == 200 and 'data' in res.json() and 'gradient_start' in res.json().get('data', {}), 'POST /api/ai/generate-art -> 200 with art spec')

    # 18. AI Analyze Room
    res = client.post('/api/ai/analyze-room', {'objective': 'Serene Japanese minimalist study', 'room_scene': 'office'}, format='json')
    assert_eq(res.status_code == 200 and 'space_harmony_score' in res.json().get('data', {}), 'POST /api/ai/analyze-room -> 200 with spatial harmony report')

    print("============================================================")
    print(f"📊 Results: {passed} PASSED, {failed} FAILED")
    print("============================================================")

    if failed == 0:
        print("🎉 ALL 18 EXTENDED TESTS PASSED WITH 100% SUCCESS!")
    else:
        sys.exit(1)

if __name__ == '__main__':
    test_suite()
