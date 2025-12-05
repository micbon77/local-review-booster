
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Manually parse .env.local
const envPath = path.resolve(__dirname, '../.env.local');
console.log(`Reading env from: ${envPath}`);

if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        env[key] = value;
    }
});

console.log('Found keys:', Object.keys(env));

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!SERVICE_KEY) console.error('Missing SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

// 2. Initialize Supabase Admin
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function main() {
    const email = 'michelebonanno1977@gmail.com';
    console.log(`Checking user: ${email}...`);

    // 3. Find user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log(`Found user ID: ${user.id}`);
    console.log(`Current status: ${user.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'}`);

    if (user.email_confirmed_at) {
        console.log('User is already confirmed!');
        return;
    }

    // 4. Confirm user
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
    );

    if (updateError) {
        console.error('Error updating user:', updateError);
    } else {
        console.log('✅ User confirmed successfully!');
        console.log('New confirmed_at:', data.user.email_confirmed_at);
    }
}

main();
