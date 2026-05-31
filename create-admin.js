import fetch from 'node-fetch';

// Admin account details
const adminDetails = {
  setupKey: "KOTULO_ADMIN_SETUP_2024",
  name: "Kotulo",
  email: "gopolang@kotulo.co.za",
  password: "KotuloFarm@25"
};

async function createAdmin() {
  try {
    console.log('🔐 Creating admin account...');
    
    const response = await fetch('http://localhost:5000/api/admin/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminDetails)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin account created successfully!');
      console.log('📧 Email:', adminDetails.email);
      console.log('🔑 Password:', adminDetails.password);
      console.log('🌐 Login at: http://localhost:5000/login');
      console.log('\n🎉 You can now log in as admin!');
    } else {
      console.log('❌ Error creating admin account:');
      console.log(data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n💡 Make sure the server is running on port 5000');
  }
}

// Run the admin creation
createAdmin();
