import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.utils import timezone
from apps.accounts.models import User, UserDetails
from apps.products.models import Product
from apps.designs.models import CustomDesign, RoomImage
from apps.orders.models import Order

BACKUP_DIR = BASE_DIR / 'backup_local_mongodb'

def parse_iso_date(val):
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    if isinstance(val, dict) and '$date' in val:
        val = val['$date']
    if isinstance(val, str):
        try:
            return datetime.fromisoformat(val.replace('Z', '+00:00'))
        except Exception:
            return None
    return None

def extract_id(doc):
    raw_id = doc.get('_id')
    if isinstance(raw_id, dict) and '$oid' in raw_id:
        return str(raw_id['$oid'])
    return str(raw_id) if raw_id is not None else ''

def extract_ref_id(val):
    if not val:
        return ''
    if isinstance(val, dict) and '$oid' in val:
        return str(val['$oid'])
    return str(val)

def load_from_mongo_or_json():
    docs = {
        'users': [],
        'user_details': [],
        'products': [],
        'customdesigns': [],
        'orders': [],
        'roomimages': [],
    }

    # 1. Try connecting to live MongoDB Atlas
    mongo_uri = os.getenv('MONGODB_URI')
    connected = False
    if mongo_uri:
        try:
            import pymongo
            client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=4000)
            db = client.get_database('kaya')
            # Test connection
            cols = db.list_collection_names()
            print(f"📡 Connected to live MongoDB Atlas cluster! Found collections: {cols}")
            for col in docs.keys():
                col_name = col
                if col_name not in cols and col_name == 'user_details' and 'userdetails' in cols:
                    col_name = 'userdetails'
                if col_name in cols:
                    docs[col] = list(db[col_name].find())
                    print(f"   Loaded {len(docs[col])} records from MongoDB collection '{col_name}'")
            connected = True
        except Exception as e:
            print(f"ℹ️ Could not connect directly to Atlas ({e}). Falling back to local JSON backups...")

    # 2. Fallback to backup_local_mongodb/*.json
    if not connected or any(len(v) == 0 for k, v in docs.items() if k != 'user_details'):
        print(f"📂 Loading data from backup directory: {BACKUP_DIR}")
        file_map = {
            'users': 'users.json',
            'user_details': 'user_details.json',
            'products': 'products.json',
            'customdesigns': 'customdesigns.json',
            'orders': 'orders.json',
            'roomimages': 'roomimages.json',
        }
        for key, fname in file_map.items():
            fpath = BACKUP_DIR / fname
            if fpath.exists():
                try:
                    with open(fpath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if isinstance(data, list) and (len(docs[key]) == 0 or not connected):
                            docs[key] = data
                            print(f"   Loaded {len(data)} records from '{fname}'")
                except Exception as ex:
                    print(f"   Failed to load '{fname}': {ex}")

    return docs

def run_migration():
    print("=" * 60)
    print("🚀 Starting KAYA MongoDB to SQLite Migration")
    print("=" * 60)

    data = load_from_mongo_or_json()

    # User ID map: mongo_id -> User instance
    user_map = {}
    product_map = {}
    design_map = {}

    # 1. Migrate Users
    print("\n1️⃣ Migrating Users...")
    users_created = 0
    users_updated = 0
    for u_doc in data.get('users', []):
        m_id = extract_id(u_doc)
        email = u_doc.get('email', '').strip().lower()
        if not email:
            continue

        user = User.objects.filter(email__iexact=email).first()
        if not user and m_id:
            user = User.objects.filter(mongo_id=m_id).first()

        pw_hash = u_doc.get('password', '')
        is_admin = bool(u_doc.get('is_admin') is True or u_doc.get('role') in ['admin', 'administrator'])
        role = 'admin' if is_admin else (u_doc.get('role') or 'user')

        if not user:
            user = User(
                email=email,
                name=u_doc.get('name', 'User').strip(),
                is_admin=is_admin,
                role=role,
                phone=u_doc.get('phone', '') or '',
                address=u_doc.get('address', '') or '',
                city=u_doc.get('city', '') or '',
                postal_code=u_doc.get('postal_code', '') or '',
                bio=u_doc.get('bio', '') or '',
                profile_image=u_doc.get('profile_image', '') or '',
                mongo_id=m_id,
            )
            # Directly set password to retain existing bcrypt hash without double hashing
            user.password = pw_hash
            user.save()
            users_created += 1
        else:
            user.name = u_doc.get('name') or user.name
            user.is_admin = is_admin
            user.role = role
            user.mongo_id = m_id
            if pw_hash and not user.password:
                user.password = pw_hash
            user.save()
            users_updated += 1

        if m_id:
            user_map[m_id] = user
        user_map[email] = user

    print(f"   ✅ Users migrated: {users_created} created, {users_updated} updated. Total: {User.objects.count()}")

    # 2. Migrate UserDetails
    print("\n2️⃣ Migrating UserDetails...")
    details_count = 0
    for d_doc in data.get('user_details', []):
        user_ref = extract_ref_id(d_doc.get('user'))
        email_ref = d_doc.get('email', '').strip().lower()
        user = user_map.get(user_ref) or user_map.get(email_ref)
        if not user and email_ref:
            user = User.objects.filter(email__iexact=email_ref).first()

        if user:
            details, _ = UserDetails.objects.get_or_create(user=user)
            details.name = d_doc.get('name') or user.name
            details.email = d_doc.get('email') or user.email
            details.phone = d_doc.get('phone') or user.phone or ''
            details.address = d_doc.get('address') or user.address or ''
            details.city = d_doc.get('city') or user.city or ''
            details.state = d_doc.get('state') or ''
            details.postal_code = d_doc.get('postal_code') or user.postal_code or ''
            details.country = d_doc.get('country') or 'India'
            details.bio = d_doc.get('bio') or user.bio or ''
            details.profile_image = d_doc.get('profile_image') or user.profile_image or ''
            details.avatar = d_doc.get('avatar') or details.profile_image or ''
            details.preferred_style = d_doc.get('preferred_style') or 'Contemporary Minimalist'
            details.design_firm = d_doc.get('design_firm') or ''
            details.shipping_notes = d_doc.get('shipping_notes') or ''
            details.mongo_id = extract_id(d_doc)
            details.save()
            details_count += 1

    print(f"   ✅ UserDetails synced: {details_count}")

    # 3. Migrate Products
    print("\n3️⃣ Migrating Products...")
    prods_count = 0
    for p_doc in data.get('products', []):
        m_id = extract_id(p_doc)
        name = p_doc.get('name', '').strip()
        if not name:
            continue

        product = Product.objects.filter(name__iexact=name).first()
        if not product and m_id:
            product = Product.objects.filter(mongo_id=m_id).first()

        base_price = p_doc.get('base_price', 0)
        if isinstance(base_price, dict) and '$numberDecimal' in base_price:
            base_price = float(base_price['$numberDecimal'])

        if not product:
            product = Product.objects.create(
                name=name,
                category=p_doc.get('category'),
                description=p_doc.get('description'),
                base_price=float(base_price),
                image_path=p_doc.get('image_path'),
                is_active=bool(p_doc.get('is_active', True)),
                in_stock=bool(p_doc.get('in_stock', True)),
                mongo_id=m_id,
            )
        else:
            product.category = p_doc.get('category') or product.category
            product.description = p_doc.get('description') or product.description
            product.base_price = float(base_price) if base_price else product.base_price
            product.image_path = p_doc.get('image_path') or product.image_path
            product.is_active = bool(p_doc.get('is_active', product.is_active))
            product.in_stock = bool(p_doc.get('in_stock', product.in_stock))
            product.mongo_id = m_id
            product.save()

        prods_count += 1
        if m_id:
            product_map[m_id] = product
        product_map[name.lower()] = product

    print(f"   ✅ Products synced: {prods_count}. Total in SQLite: {Product.objects.count()}")

    # 4. Migrate Custom Designs
    print("\n4️⃣ Migrating Custom Designs...")
    designs_count = 0
    for d_doc in data.get('customdesigns', []):
        m_id = extract_id(d_doc)
        user_ref = extract_ref_id(d_doc.get('user'))
        prod_ref = extract_ref_id(d_doc.get('product'))

        user = user_map.get(user_ref)
        product = product_map.get(prod_ref)
        if not product and isinstance(d_doc.get('product'), dict):
            p_name = d_doc['product'].get('name', '').lower()
            product = product_map.get(p_name)

        if not product:
            # Fallback to first product
            product = Product.objects.first()

        design_json = d_doc.get('design_json')
        if isinstance(design_json, str):
            try:
                design_json = json.loads(design_json)
            except Exception:
                design_json = {}

        design = None
        if m_id:
            design = CustomDesign.objects.filter(mongo_id=m_id).first()

        if not design:
            design = CustomDesign.objects.create(
                user=user,
                product=product,
                design_json=design_json or {},
                preview_image_path=d_doc.get('preview_image_path'),
                room_image_path=d_doc.get('room_image_path'),
                status=d_doc.get('status', 'saved'),
                mongo_id=m_id,
            )
        else:
            design.user = user
            design.product = product
            design.design_json = design_json or design.design_json
            design.status = d_doc.get('status', design.status)
            design.save()

        designs_count += 1
        if m_id:
            design_map[m_id] = design

    print(f"   ✅ Custom Designs synced: {designs_count}. Total in SQLite: {CustomDesign.objects.count()}")

    # 5. Migrate Orders
    print("\n5️⃣ Migrating Orders...")
    orders_count = 0
    for o_doc in data.get('orders', []):
        m_id = extract_id(o_doc)
        order_num = o_doc.get('order_number')
        if not order_num:
            continue

        user_ref = extract_ref_id(o_doc.get('user'))
        design_ref = extract_ref_id(o_doc.get('custom_design'))

        user = user_map.get(user_ref)
        design = design_map.get(design_ref)

        total_price = o_doc.get('total_price', 0)
        if isinstance(total_price, dict) and '$numberDecimal' in total_price:
            total_price = float(total_price['$numberDecimal'])

        cart_items = o_doc.get('cart_items')
        if isinstance(cart_items, str):
            try:
                cart_items = json.loads(cart_items)
            except Exception:
                pass

        order = Order.objects.filter(order_number=order_num).first()
        if not order and m_id:
            order = Order.objects.filter(mongo_id=m_id).first()

        if not order:
            order = Order.objects.create(
                user=user,
                custom_design=design,
                order_number=order_num,
                total_price=float(total_price),
                status=o_doc.get('status', 'placed'),
                cancelled_by=o_doc.get('cancelled_by'),
                cancelled_at=parse_iso_date(o_doc.get('cancelled_at')),
                shipping_address=o_doc.get('shipping_address'),
                customer_name=o_doc.get('customer_name'),
                customer_phone=o_doc.get('customer_phone'),
                customer_email=o_doc.get('customer_email'),
                cart_items=cart_items,
                payment_id=o_doc.get('payment_id'),
                payment_status=o_doc.get('payment_status', 'pending'),
                placed_at=parse_iso_date(o_doc.get('placed_at')),
                mongo_id=m_id,
            )
        else:
            order.user = user
            order.custom_design = design
            order.total_price = float(total_price)
            order.status = o_doc.get('status', order.status)
            order.cancelled_by = o_doc.get('cancelled_by', order.cancelled_by)
            order.cancelled_at = parse_iso_date(o_doc.get('cancelled_at')) or order.cancelled_at
            order.mongo_id = m_id
            order.save()

        orders_count += 1

    print(f"   ✅ Orders synced: {orders_count}. Total in SQLite: {Order.objects.count()}")

    # 6. Migrate Room Images
    print("\n6️⃣ Migrating Room Images...")
    rooms_count = 0
    for r_doc in data.get('roomimages', []):
        m_id = extract_id(r_doc)
        path = r_doc.get('path')
        if not path:
            continue
        user_ref = extract_ref_id(r_doc.get('user'))
        user = user_map.get(user_ref)

        r_img = None
        if m_id:
            r_img = RoomImage.objects.filter(mongo_id=m_id).first()
        if not r_img:
            RoomImage.objects.create(
                user=user,
                path=path,
                mongo_id=m_id,
            )
        rooms_count += 1

    print(f"   ✅ Room Images synced: {rooms_count}. Total in SQLite: {RoomImage.objects.count()}")

    print("\n" + "=" * 60)
    print("🎉 SQLite Migration Completed Successfully!")
    print(f"   Users: {User.objects.count()}")
    print(f"   UserDetails: {UserDetails.objects.count()}")
    print(f"   Products: {Product.objects.count()}")
    print(f"   CustomDesigns: {CustomDesign.objects.count()}")
    print(f"   Orders: {Order.objects.count()}")
    print(f"   RoomImages: {RoomImage.objects.count()}")
    print("=" * 60)

if __name__ == '__main__':
    run_migration()

