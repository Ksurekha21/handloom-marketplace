from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import pathlib
import os
from sqlalchemy import func, or_
from db_config import db
from models import Saree, User, Order, Review

buyer_bp = Blueprint('buyer', __name__)

@buyer_bp.route('/products', methods=['GET'])
def get_all_products():
    # allow optional filtering by material, saree_type and keyword q via query params
    material = request.args.get('material')
    saree_type = request.args.get('saree_type')
    q = request.args.get('q')
    # pagination/sorting
    try:
        limit = int(request.args.get('limit', 24))
    except ValueError:
        limit = 24
    try:
        offset = int(request.args.get('offset', 0))
    except ValueError:
        offset = 0
    sort = request.args.get('sort')  # 'price_asc','price_desc','newest'

    # join with user so we can search weaver name/state
    query = Saree.query.join(User, Saree.weaver)

    # exact filters
    if material:
        query = query.filter(func.lower(Saree.category).like(f"%{material.lower()}%"))
    if saree_type:
        if hasattr(Saree, 'saree_type'):
            query = query.filter(func.lower(Saree.saree_type).like(f"%{saree_type.lower()}%"))
        else:
            query = query.filter(Saree.title.ilike(f"%{saree_type}%"))

    # keyword search across multiple fields
    if q:
        q_like = f"%{q}%"
        clauses = [Saree.title.ilike(q_like), Saree.description.ilike(q_like), Saree.category.ilike(q_like), Saree.color.ilike(q_like)]
        if hasattr(Saree, 'saree_type'):
            clauses.append(Saree.saree_type.ilike(q_like))
        # search weaver name and state
        clauses.append(User.name.ilike(q_like))
        clauses.append(User.state.ilike(q_like))
        query = query.filter(or_(*clauses))

    # total count before pagination
    try:
        total = query.count()
    except Exception:
        total = 0

    # sorting
    if sort == 'price_asc':
        query = query.order_by(Saree.price.asc())
    elif sort == 'price_desc':
        query = query.order_by(Saree.price.desc())
    else:
        query = query.order_by(Saree.created_at.desc())

    sarees = query.offset(offset).limit(limit).all()
    print(f"[buyer.get_all_products] params: material={material} saree_type={saree_type} q={q} offset={offset} limit={limit} -> found {len(sarees)} rows (total {total})")
    products = []
    for s in sarees:
        # determine saree_type: prefer explicit column, else try to derive from title like 'Venkatagiri (Pattu)'
        if hasattr(s, 'saree_type') and getattr(s, 'saree_type'):
            stype = s.saree_type
        else:
            # derive from title: take substring before first '(' or full title if not present
            title = (s.title or '')
            if '(' in title:
                stype = title.split('(')[0].strip()
            else:
                # fallback: try first two words
                stype = ' '.join(title.split()[:2]) if title else ''

        products.append({
            "id": s.id,
            "title": s.title,
            "price": s.price,
            # material is stored in category column
            "material": s.category,
            "saree_type": stype,
            "description": s.description,
            "weaver_id": s.weaver_id,
            "image_url": s.image_url,
            "color": s.color,
            "days_to_weave": s.days_to_weave,
            "raw_material_cost": s.raw_material_cost,
            "weaver_name": s.weaver.name if s.weaver else "Unknown",
            "weaver_state": s.weaver.state if s.weaver else "Unknown",
            "weaver_experience": s.weaver.years_experience if s.weaver else 0
        })
    return jsonify({"products": products}), 200

@buyer_bp.route('/order', methods=['POST'])
def place_order():

    data = request.json

    saree_id = data['saree_id']

    # Defensive check
    if isinstance(saree_id,str) and not saree_id.isdigit():

        return jsonify({
        "error":"Invalid product"
        }),400


    order = Order(

        buyer_id=int(data['buyer_id']),

        saree_id=int(saree_id),

        payment_method=data['payment_method'],

        status="Pending",              # ADD THIS

        estimated_delivery=None       # ADD THIS

    )

    db.session.add(order)

    db.session.commit()

    # Check if buyer already left a review for this saree and include it in the response
    existing_review = Review.query.filter_by(saree_id=order.saree_id, buyer_id=order.buyer_id).first()
    prev = None
    if existing_review:
        prev = {
            'id': existing_review.id,
            'rating': existing_review.rating,
            'comment': existing_review.comment,
            'created_at': existing_review.created_at.isoformat()
        }

    return jsonify({
        "message": "Order placed successfully",
        "id": order.id,
        "previous_review": prev
    }), 201
@buyer_bp.route('/orders/<int:buyer_id>')
def get_orders(buyer_id):

    orders = db.session.query(Order,Saree)\
    .join(Saree,Order.saree_id==Saree.id)\
    .filter(Order.buyer_id==buyer_id)\
    .all()

    results=[]

    for order,saree in orders:

        results.append({

        "id":order.id,

        "saree_title":saree.title,

        "status":order.status,

        "price":saree.price,

        "estimated_delivery":
        order.estimated_delivery,

        "created_at":
        order.created_at.isoformat()


        })

    return jsonify({
    "orders":results
    }),200

@buyer_bp.route('/review', methods=['POST'])
def add_review():
    try:
        # Log incoming content-type and headers for debugging
        print('[buyer.add_review] CONTENT_TYPE:', request.content_type)
        # Prefer form parsing when possible (covers multipart/form-data and urlencoded)
        form = request.form or {}
        files = request.files or {}

        if form and (form.get('saree_id') or form.get('buyer_id') or form.get('rating')):
            saree_id = int(form.get('saree_id')) if form.get('saree_id') else None
            buyer_id = int(form.get('buyer_id')) if form.get('buyer_id') else None
            rating = int(form.get('rating')) if form.get('rating') else None
            comment = form.get('comment', '')
            after_delivery = form.get('after_delivery', '0') in ('1', 'true', 'True')
            photo = files.get('photo') if 'photo' in files else None
        else:
            # Fallback: try JSON body even when content-type may be wrong
            data = request.get_json(force=True, silent=True) or {}
            saree_id = int(data.get('saree_id')) if data.get('saree_id') else None
            buyer_id = int(data.get('buyer_id')) if data.get('buyer_id') else None
            rating = int(data.get('rating')) if data.get('rating') else None
            comment = data.get('comment', '')
            after_delivery = bool(data.get('after_delivery'))
            photo = None

        if not saree_id or not buyer_id or not rating:
            return jsonify({'error': 'Missing required fields'}), 400

        # handle photo upload (save locally under backend/uploads)
        photo_url = None
        if photo and photo.filename:
            filename = secure_filename(photo.filename)
            upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
            pathlib.Path(upload_folder).mkdir(parents=True, exist_ok=True)
            save_path = os.path.join(upload_folder, filename)
            photo.save(save_path)
            host = request.host_url.rstrip('/')
            photo_url = f"{host}/uploads/{filename}"
            # append a marker in the comment to reference saved photo
            comment = (comment or '') + f"\n[photo:{photo_url}]"

        # indicate if review is deferred until after delivery
        if after_delivery:
            comment = (comment or '') + "\n[after_delivery:1]"

        review = Review(
            saree_id=saree_id,
            buyer_id=buyer_id,
            rating=rating,
            comment=comment
        )
        db.session.add(review)
        db.session.commit()
        return jsonify({"message": "Review added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@buyer_bp.route('/search', methods=['GET'])
def search_sarees():
    """Search endpoint that returns sarees uploaded by users with role 'weaver'.
    Supports q (keyword), material, saree_type, color, state, weaver_name,
    sort (newest, price_asc, price_desc), page, per_page.
    """
    q = request.args.get('q', '').strip()
    material = request.args.get('material')
    saree_type = request.args.get('saree_type')
    color = request.args.get('color')
    state = request.args.get('state')
    weaver_name = request.args.get('weaver_name')
    sort = request.args.get('sort', 'relevance')
    try:
        page = int(request.args.get('page', 1))
    except Exception:
        page = 1
    try:
        per_page = int(request.args.get('per_page', 24))
    except Exception:
        per_page = 24

    query = db.session.query(Saree).join(User).filter(User.role == 'weaver')

    # build search predicate
    if q:
        term = f"%{q}%"
        query = query.filter(or_(
            Saree.title.ilike(term),
            Saree.description.ilike(term),
            Saree.category.ilike(term),
            func.coalesce(getattr(Saree, 'saree_type', ''), '').ilike(term),
            getattr(Saree, 'color', '').ilike(term),
            getattr(User, 'state', '').ilike(term),
            getattr(User, 'name', '').ilike(term)
        ))

    if material:
        query = query.filter(Saree.category.ilike(f"%{material}%"))
    if saree_type:
        if hasattr(Saree, 'saree_type'):
            query = query.filter(func.lower(Saree.saree_type).like(f"%{saree_type.lower()}%"))
        else:
            query = query.filter(Saree.title.ilike(f"%{saree_type}%"))
    if color:
        query = query.filter(getattr(Saree, 'color', '').ilike(f"%{color}%"))
    if state:
        query = query.filter(getattr(User, 'state', '').ilike(f"%{state}%"))
    if weaver_name:
        query = query.filter(getattr(User, 'name', '').ilike(f"%{weaver_name}%"))

    total = query.count()

    # sorting
    if sort == 'newest':
        query = query.order_by(Saree.created_at.desc())
    elif sort == 'price_asc':
        query = query.order_by(Saree.price.asc())
    elif sort == 'price_desc':
        query = query.order_by(Saree.price.desc())

    offset = (page - 1) * per_page
    rows = query.offset(offset).limit(per_page).all()

    products = []
    for s in rows:
        if hasattr(s, 'saree_type') and getattr(s, 'saree_type'):
            stype = s.saree_type
        else:
            title = (s.title or '')
            if '(' in title:
                stype = title.split('(')[0].strip()
            else:
                stype = ' '.join(title.split()[:2]) if title else ''

        products.append({
            'id': s.id,
            'title': s.title,
            'price': s.price,
            'material': s.category,
            'saree_type': stype,
            'description': s.description,
            'image_url': s.image_url,
            'color': s.color,
            'days_to_weave': s.days_to_weave,
            'weaver_name': s.weaver.name if s.weaver else 'Unknown',
            'weaver_state': s.weaver.state if s.weaver else 'Unknown',
            'weaver_id': s.weaver_id
        })

    return jsonify({
        'total': total,
        'page': page,
        'per_page': per_page,
        'products': products
    }), 200


@buyer_bp.route('/product/<int:saree_id>', methods=['GET'])
def get_product_details(saree_id):
    # fetch saree by id; do not strictly require User.role == 'weaver' here
    # because some uploads may have missing/incorrect role flags in legacy data.
    s = db.session.query(Saree).filter(Saree.id == saree_id).first()
    if not s:
        return jsonify({'error': 'Product not found'}), 404

    # derive saree_type if not present
    if hasattr(s, 'saree_type') and getattr(s, 'saree_type'):
        stype = s.saree_type
    else:
        title = (s.title or '')
        if '(' in title:
            stype = title.split('(')[0].strip()
        else:
            stype = ' '.join(title.split()[:2]) if title else ''

    # images gallery: handle filenames, absolute URLs, or inline data URLs
    images = []
    raw_field = getattr(s, 'image_url', None) or ''
    if raw_field:
        # If the stored string contains a data URL, treat it as a single image
        if 'data:' in raw_field:
            raw_images = [raw_field]
        else:
            # otherwise assume comma-separated filenames/urls
            raw_images = [u.strip() for u in raw_field.split(',') if u.strip()]

        # convert to usable image sources: keep http/data as-is, prefix filenames
        for u in raw_images:
            if u.lower().startswith('http') or u.lower().startswith('data:'):
                images.append(u)
            else:
                fname = os.path.basename(u)
                images.append(request.host_url.rstrip('/') + '/uploads/' + fname)

    # video url if present (migration may have added this column)
    video_url = getattr(s, 'video_url', None)
    if video_url and not str(video_url).lower().startswith('http'):
        video_url = request.host_url.rstrip('/') + '/uploads/' + os.path.basename(str(video_url))

    # reviews
    reviews_q = db.session.query(Review).filter(Review.saree_id == saree_id).all()
    reviews = []
    for r in reviews_q:
        reviews.append({
            'id': r.id,
            'buyer_id': r.buyer_id,
            'buyer_name': r.buyer.name if r.buyer else 'Anonymous',
            'rating': r.rating,
            'comment': r.comment,
            'created_at': r.created_at.isoformat()
        })

    product = {
        'id': s.id,
        'title': s.title,
        'price': s.price,
        'material': s.category,
        'saree_type': stype,
        'description': s.description,
        'images': images,
        'image_url': images[0] if images else getattr(s, 'image_url', None),
        'video_url': video_url,
        'color': getattr(s, 'color', None),
        'length': getattr(s, 'length', None),
        'width': getattr(s, 'width', None),
        'weight': getattr(s, 'weight', None),
        'stock': getattr(s, 'stock', None),
        'days_to_weave': s.days_to_weave,
        'weaver': {
            'id': s.weaver_id,
            'name': s.weaver.name if s.weaver else 'Unknown',
            'state': s.weaver.state if s.weaver else 'Unknown',
            'village': getattr(s.weaver, 'village', None),
            'experience': s.weaver.years_experience if s.weaver else None
        },
        'reviews': reviews,
        'uploaded_at': s.created_at.isoformat() if getattr(s, 'created_at', None) else None
    }

    return jsonify({'product': product}), 200


@buyer_bp.route('/suggestions', methods=['GET'])
def search_suggestions():
    """Return live suggestions derived from actual weaver-uploaded sarees.
    Searches title, category, and derived saree_type.
    """
    q = request.args.get('q', '').strip()
    limit = int(request.args.get('limit', 8))
    if not q:
        # return top saree types (distinct) by recent uploads
        rows = db.session.query(Saree).join(User).filter(User.role == 'weaver').order_by(Saree.created_at.desc()).limit(50).all()
        seen = []
        out = []
        for s in rows:
            if hasattr(s, 'saree_type') and s.saree_type:
                label = s.saree_type
            else:
                title = s.title or ''
                label = title.split('(')[0].strip() if '(' in title else ' '.join(title.split()[:2])
            if label and label.lower() not in seen:
                seen.append(label.lower()); out.append(label)
            if len(out) >= limit: break
        return jsonify({'suggestions': out}), 200

    term = f"%{q}%"
    # gather distinct suggestion strings from title, category, saree_type
    titles = db.session.query(Saree.title).join(User).filter(User.role == 'weaver', Saree.title.ilike(term)).limit(30).all()
    cats = db.session.query(Saree.category).join(User).filter(User.role == 'weaver', Saree.category.ilike(term)).limit(30).all()
    results = []
    seen = set()
    for (t,) in titles:
        if not t: continue
        label = t.split('(')[0].strip()
        if label.lower() not in seen:
            seen.add(label.lower()); results.append(label)
        if len(results) >= limit: break
    for (c,) in cats:
        if not c: continue
        if c.lower() not in seen:
            seen.add(c.lower()); results.append(c)
        if len(results) >= limit: break

    return jsonify({'suggestions': results[:limit]}), 200

@buyer_bp.route('/reviews/<int:saree_id>', methods=['GET'])
def get_reviews(saree_id):
    reviews = Review.query.filter_by(saree_id=saree_id).all()
    result = []
    for r in reviews:
        result.append({
            "id": r.id,
            "buyer_name": r.buyer.name if r.buyer else "Anonymous",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.strftime("%Y-%m-%d")
        })
    return jsonify({"reviews": result}), 200
