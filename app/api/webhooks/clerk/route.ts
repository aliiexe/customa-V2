import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || 'whsec_test_secret');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  // Handle the webhook
  if (eventType === 'user.created') {
    const { id: userId, email_addresses, first_name, last_name } = evt.data;
    
    if (email_addresses && email_addresses.length > 0) {
      const email = email_addresses[0].email_address;
      
      try {
        // Check if user already exists
        const checkSql = `SELECT id FROM users WHERE email = ?`;
        const existingUsers = await query(checkSql, [email]);
        
        if (!Array.isArray(existingUsers) || existingUsers.length === 0) {
          // Create new user
          const insertSql = `
            INSERT INTO users (firstname, lastname, email, username, balance, actived, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
          `;
          
          const username = email.split('@')[0]; // Use email prefix as username
          await query(insertSql, [
            first_name || '',
            last_name || '',
            email,
            username,
            0, // default balance
            1  // active by default
          ]);
          
          console.log(`Created user in database: ${email}`);
        } else {
          console.log(`User already exists in database: ${email}`);
        }
      } catch (error) {
        console.error('Error creating user in database:', error);
        return new Response('Error creating user', { status: 500 });
      }
    }
  }

  return NextResponse.json({ success: true });
} 