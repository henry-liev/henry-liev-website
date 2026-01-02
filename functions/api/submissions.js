/**
 * Cloudflare Pages Function to retrieve contact form submissions
 * 
 * GET /api/submissions - Get all submissions
 * GET /api/submissions?delete=ID - Delete a specific submission
 * 
 * Environment variables needed:
 * - CONTACT_SUBMISSIONS: Cloudflare KV namespace binding name
 * - ADMIN_PASSWORD: Optional password protection (set query param ?password=...)
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Optional password protection
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    const adminPassword = env.ADMIN_PASSWORD;
    
    if (adminPassword && password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get KV namespace
    const kv = env.CONTACT_SUBMISSIONS;
    
    if (!kv) {
      return new Response(
        JSON.stringify({ error: 'KV namespace not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if delete request
    const deleteId = url.searchParams.get('delete');
    if (deleteId) {
      // Delete the submission
      await kv.delete(`submission:${deleteId}`);
      
      // Remove from list
      const listKey = 'submissions:list';
      const existingList = await kv.get(listKey);
      if (existingList) {
        try {
          let submissionIds = JSON.parse(existingList);
          submissionIds = submissionIds.filter(id => id !== deleteId);
          await kv.put(listKey, JSON.stringify(submissionIds));
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Submission deleted' }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get list of submission IDs
    const listKey = 'submissions:list';
    const listData = await kv.get(listKey);
    let submissionIds = [];
    
    if (listData) {
      try {
        submissionIds = JSON.parse(listData);
      } catch (e) {
        submissionIds = [];
      }
    }
    
    // Fetch all submissions
    const submissions = [];
    for (const id of submissionIds) {
      const submissionData = await kv.get(`submission:${id}`);
      if (submissionData) {
        try {
          submissions.push(JSON.parse(submissionData));
        } catch (e) {
          // Skip invalid entries
        }
      }
    }
    
    // Sort by timestamp (newest first)
    submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return new Response(
      JSON.stringify({ 
        success: true,
        count: submissions.length,
        submissions: submissions
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
    
  } catch (error) {
    console.error('Error retrieving submissions:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

