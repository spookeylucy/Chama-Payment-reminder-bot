from app import app, db, Member, Chama, Payment
from datetime import datetime, timedelta

def seed_database():
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Clear existing data
        Payment.query.delete()
        Member.query.delete()
        Chama.query.delete()
        
        # Create sample chama
        chama = Chama(
            name="Weekly Savings Chama",
            due_date=datetime.now().date() + timedelta(days=7),
            amount_expected=1000.0
        )
        db.session.add(chama)
        
        # Create sample members
        members_data = [
            {"name": "Alice Wanjiku", "phone_number": "+254712345678", "has_paid": True},
            {"name": "John Kimani", "phone_number": "+254723456789", "has_paid": False},
            {"name": "Mary Achieng", "phone_number": "+254734567890", "has_paid": True},
            {"name": "Peter Mwangi", "phone_number": "+254745678901", "has_paid": False},
            {"name": "Grace Njeri", "phone_number": "+254756789012", "has_paid": True},
            {"name": "David Ochieng", "phone_number": "+254767890123", "has_paid": False},
            {"name": "Sarah Wanjiru", "phone_number": "+254778901234", "has_paid": False},
            {"name": "James Kiprotich", "phone_number": "+254789012345", "has_paid": True},
            {"name": "Lucy Nyambura", "phone_number": "+254790123456", "has_paid": False},
            {"name": "Michael Omondi", "phone_number": "+254701234567", "has_paid": True}
        ]
        
        members = []
        for member_data in members_data:
            member = Member(**member_data)
            members.append(member)
            db.session.add(member)
        
        db.session.commit()
        
        # Create sample payments for paid members
        paid_members = [m for m in members if m.has_paid]
        for member in paid_members:
            payment = Payment(
                member_id=member.id,
                amount=1000.0,
                date=datetime.utcnow() - timedelta(days=1),
                chama_id=chama.id
            )
            db.session.add(payment)
        
        db.session.commit()
        
        print("Database seeded successfully!")
        print(f"Created {len(members)} members")
        print(f"Created {len(paid_members)} payments")
        print(f"Unpaid members: {len([m for m in members if not m.has_paid])}")

if __name__ == "__main__":
    seed_database()