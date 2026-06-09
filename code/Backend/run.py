from flaskevent import app, db

if __name__ == "__main__":
    with app.app_context():
        print("🔄 Creating database tables...")
        db.create_all()
        print("✅ Database tables created successfully!")
    app.run(debug=True, host='0.0.0.0', port=5005)