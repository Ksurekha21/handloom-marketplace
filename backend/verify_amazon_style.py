import requests
import sys

BASE_URL = "http://localhost:5000/api"

def test_registration_and_auto_login(email, role):
    print(f"\n--- Testing registration for {email} ({role}) ---")
    data = {
        "name": f"Test {role.capitalize()}",
        "email": email,
        "password": "password123",
        "role": role,
        "state": "Test State"
    }
    if role == "weaver":
        data["weaver_material"] = "Cotton"
        data["weaver_saree_type"] = "Kanchipuram"

    try:
        r = requests.post(f"{BASE_URL}/auth/register", json=data)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
        
        if r.status_code == 201:
            res_data = r.json()
            if res_data.get('id') and res_data.get('role') == role:
                print(f"SUCCESS: Auto-login data returned for {role}.")
                return True
            else:
                print(f"FAILED: Missing user data in response.")
                return False
        elif r.status_code == 400 and "already registered" in r.text:
            print("INFO: Email already registered, skipping.")
            return True
        else:
            print(f"FAILED: Registration failed with {r.status_code}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    v1 = test_registration_and_auto_login("new_weaver@test.com", "weaver")
    v2 = test_registration_and_auto_login("new_supplier@test.com", "supplier")
    v3 = test_registration_and_auto_login("new_buyer@test.com", "buyer")
    
    if v1 and v2 and v3:
        print("\nAll role registrations verified successfully!")
    else:
        print("\nSome verifications FAILED.")
        sys.exit(1)
