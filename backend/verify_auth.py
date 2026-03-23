import requests
import sys

BASE_URL = "http://localhost:5000/api"

def test_login(email, password):
    print(f"Testing login for {email}...")
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
        return r.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    # Test with valid weaver credentials from DB
    success = test_login("klnarayana1977@gmail.com", "narayana@1977")
    
    # Test with invalid password
    test_login("klnarayana1977@gmail.com", "wrong_password")
    
    if success:
        print("\nVerification SUCCESSFUL: Backend login logic is working correctly.")
    else:
        print("\nVerification FAILED: Could not log in with known credentials.")
        sys.exit(1)
