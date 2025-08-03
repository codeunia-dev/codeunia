# 🔧 Integration Guide: PremiumButton & UserDisplay

## 📋 **Step-by-Step Integration**

### **Step 1: Add Imports to Header**

Add these imports to `components/header.tsx`:

```tsx
import PremiumButton from "./PremiumButton";
import UserDisplay from "./UserDisplay";
```

### **Step 2: Update User Section in Header**

Find this section in `components/header.tsx` (around line 75):

```tsx
) : user ? (
  <div className="flex items-center space-x-2">
    <UserIcon />
    <Button 
      variant="ghost" 
      size="sm"
      onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.reload()
      }}
    >
      Sign Out
    </Button>
  </div>
```

Replace it with:

```tsx
) : user ? (
  <div className="flex items-center space-x-2">
    <PremiumButton user={user} />
    <UserDisplay userId={user.id} showCodeuniaId={false} />
    <UserIcon />
    <Button 
      variant="ghost" 
      size="sm"
      onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.reload()
      }}
    >
      Sign Out
    </Button>
  </div>
```

### **Step 3: Add Razorpay Script**

Add this script to your `app/layout.tsx` in the `<head>` section:

```tsx
<head>
  <link rel="icon" href="/codeunia-favicon.svg" type="image/svg+xml" />
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
```

### **Step 4: Add Environment Variables**

Add these to your `.env.local`:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### **Step 5: Install Razorpay Package**

Run this command:

```bash
npm install razorpay
```

## 🎯 **What This Adds**

### **PremiumButton Component:**
- Shows next to user icon
- Golden gradient for premium users
- Blue gradient for non-premium users
- Opens premium plans modal
- Handles Razorpay payment flow

### **UserDisplay Component:**
- Shows username with premium styling
- Golden gradient for premium usernames
- Crown emoji for premium users
- Optional Codeunia ID display

## 🧪 **Testing the Flow**

### **1. Test Signup Flow:**
1. Sign up with any method (Email, Google, GitHub)
2. Should redirect to `/setup`
3. Choose username
4. Complete setup
5. Redirect to dashboard

### **2. Test Premium Flow:**
1. Click "Upgrade" button
2. Select a plan
3. Complete Razorpay payment
4. Verify premium styling appears

### **3. Test Username Display:**
1. Check if usernames show correctly
2. Verify premium styling for premium users
3. Test in different components

## 🔍 **Troubleshooting**

### **Cookie Parsing Errors:**
The middleware already has error handling. If you still see errors, they're likely from Supabase and won't affect functionality.

### **Premium Button Not Showing:**
- Check if user is authenticated
- Verify component imports
- Check browser console for errors

### **Payment Not Working:**
- Verify Razorpay environment variables
- Check Razorpay dashboard for test keys
- Ensure Razorpay script is loaded

## ✅ **Expected Result**

After integration, you should see:
- Premium button next to user icon
- Username displayed with premium styling
- Complete signup flow working
- Premium purchase flow functional

## 🚀 **Ready to Test!**

Once you've completed these steps, your unified signup flow and premium integration will be fully functional! 