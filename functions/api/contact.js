/**
 * Cloudflare Pages Function to handle contact form submissions
 * 
 * This function stores form submissions in Cloudflare KV.
 * 
 * Environment variables needed:
 * - CONTACT_SUBMISSIONS: Cloudflare KV namespace binding name (default: CONTACT_SUBMISSIONS)
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Parse form data
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get KV namespace (default binding name)
    const kv = env.CONTACT_SUBMISSIONS;
    
    if (!kv) {
      console.error('CONTACT_SUBMISSIONS KV namespace not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Create submission object
    const submission = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Store in KV with unique key
    const key = `submission:${submission.id}`;
    await kv.put(key, JSON.stringify(submission));
    
    // Also maintain a list of all submission IDs
    const listKey = 'submissions:list';
    const existingList = await kv.get(listKey);
    let submissionIds = [];
    if (existingList) {
      try {
        submissionIds = JSON.parse(existingList);
      } catch (e) {
        submissionIds = [];
      }
    }
    submissionIds.push(submission.id);
    await kv.put(listKey, JSON.stringify(submissionIds));
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Form submitted successfully',
        id: submission.id 
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
    
  } catch (error) {
    console.error('Error processing contact form:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}


