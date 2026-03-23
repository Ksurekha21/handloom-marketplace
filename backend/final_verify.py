import requests

BASE_URL = "http://localhost:5000/api/auth/login"

def test_login(email, password):
    print(f"Testing login for {email}...")
    try:
        r = requests.post(BASE_URL, json={"email": email, "password": password})
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Test one of the migrated users
    # Based on previous logs, the password was likely 'password123' or similar 
    # but I don't know the exact original password for these existing users.
    # However, I can test the 'new_weaver@test.com' which I know is password123.
    test_login("new_weaver@test.com", "password123")
