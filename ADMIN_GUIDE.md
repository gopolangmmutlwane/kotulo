# Admin Guide: How to Approve/Reject Applications

## Step 1: Create an Admin Account

You need to create an admin account first. You have two options:

### Option A: Via Signup Page (Recommended)
1. Go to the signup page: `/signup`
2. Fill in the form:
   - **Name**: Your name
   - **Email**: Your admin email (e.g., `admin@kotulo.co.za`)
   - **Password**: Choose a strong password
   - **Account Type**: Select "Customer" (we'll change the role manually)
   - Complete the signup
3. After signup, you'll need to manually change the role to "admin" in the code or database

### Option B: Via API (For Development)
You can create an admin user directly via the signup API endpoint:

```bash
POST /api/auth/signup
{
  "name": "Admin User",
  "email": "admin@kotulo.co.za",
  "password": "your-secure-password",
  "role": "admin"
}
```

**Note**: The signup form doesn't show "admin" as an option for security reasons. You can either:
- Modify the signup form temporarily to allow admin role selection
- Use the API directly
- Manually update a user's role in the database/storage

## Step 2: Login as Admin

1. Go to `/login`
2. Enter your admin email and password
3. You'll be automatically redirected to `/admin` (Admin Panel)

## Step 3: Approve/Reject Applications

1. **Navigate to Admin Panel**
   - After login, you'll be on the Admin Panel (`/admin`)
   - Or click "Admin" in the navigation bar

2. **View Pending Approvals**
   - The "Pending Approvals" tab is selected by default
   - You'll see a badge showing the count of pending applications
   - All pending farmer and vendor applications are listed here

3. **Review Application Details**
   For each pending application, you can see:
   - **Basic Info**: Name, email, phone, role, business name
   - **Application Details** (if submitted):
     - Business Registration Number
     - Tax/VAT Number
     - Business Address
     - Business Description
     - Uploaded Documents (as badges)

4. **Approve or Reject**
   - Click the **"Approve"** button (green) to approve the application
   - Click the **"Reject"** button (red) to reject the application
   - The status will update immediately
   - The user will be notified (email notification - to be implemented)

## What Happens After Approval/Rejection?

### Approved Users:
- Status changes from "pending" to "approved"
- They can now:
  - Access their role-specific dashboard
  - List/manage products (farmers)
  - Stock from farmers (vendors)
  - Use all features for their role

### Rejected Users:
- Status changes from "pending" to "rejected"
- They see a message that their application was rejected
- They can contact support for more information

## Quick Access

- **Admin Panel URL**: `/admin`
- **Pending Approvals Tab**: Automatically selected when you open the admin panel
- **Navigation**: Click "Admin" in the header (only visible to admin users)

## Security Notes

- Only users with `role: "admin"` can access the admin panel
- The admin panel is protected by authentication middleware
- All approval actions are logged (you can add audit logging if needed)

