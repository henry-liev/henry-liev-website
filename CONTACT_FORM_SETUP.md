# Contact Form Setup for Cloudflare Pages

This contact form uses a Cloudflare Pages Function to store form submissions in Cloudflare KV (key-value storage).

## Setup Instructions

### 1. Create a Cloudflare KV Namespace

1. Go to your Cloudflare dashboard
2. Navigate to Workers & Pages > KV
3. Click "Create a namespace"
4. Name it something like "Contact Submissions" or "CONTACT_SUBMISSIONS"
5. Copy the namespace ID (you'll need this for the binding)

### 2. Bind KV Namespace to Your Pages Project

1. Go to Pages > Your Site > Settings > Functions
2. Scroll down to "KV Namespace Bindings"
3. Click "Add binding"
4. Set the variable name to: `CONTACT_SUBMISSIONS`
5. Select the namespace you created in step 1
6. Save

### 3. (Optional) Set Admin Password

If you want to password-protect the admin page:

1. Go to Pages > Your Site > Settings > Environment Variables
2. Add variable:
   - `ADMIN_PASSWORD`: A password to protect the submissions page (e.g., `your-secure-password`)

### 4. Deploy to Cloudflare Pages

The `functions/api/contact.js` file will automatically be deployed as a Cloudflare Pages Function. The endpoint will be available at `/api/contact`.

### 5. View Submissions

1. Visit `admin.html` on your deployed site (e.g., `https://yoursite.com/admin.html`)
2. If you set an admin password, you'll be prompted to enter it
3. You can also access it with a password in the URL: `admin.html?password=your-password`

## How It Works

- The contact form submits to `/api/contact` (a Cloudflare Pages Function)
- The function validates the form data
- It stores the submission in Cloudflare KV with a unique ID
- Submissions can be viewed on the admin page at `admin.html`
- Each submission includes: name, email, message, and timestamp

## Admin Page Features

- View all form submissions in reverse chronological order (newest first)
- See submission details: name, email, message, and timestamp
- Click email addresses to open your email client
- Delete individual submissions
- View total submission count

## Troubleshooting

- **"KV namespace not configured"**: Make sure you've bound the KV namespace to your Pages project (step 2)
- **"Unauthorized"**: If you set `ADMIN_PASSWORD`, make sure you're providing the correct password
- **Submissions not appearing**: Check that the KV namespace binding name matches `CONTACT_SUBMISSIONS` exactly

## Storage Limits

Cloudflare KV has the following limits (free tier):
- 100,000 read operations per day
- 1,000 write operations per day
- 1 GB storage

For most contact forms, this is more than sufficient. If you need more, consider upgrading your Cloudflare plan.

