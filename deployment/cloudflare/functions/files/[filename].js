/**
 * Cloudflare Pages Function for serving files from R2
 * Dynamic route: /files/[filename]
 */

export async function onRequestGet(context) {
  try {
    const { params, env, request } = context;
    const { filename } = params;

    if (!filename) {
      return new Response('Filename required', { status: 400 });
    }

    // Get file from R2
    const object = await env.WORKFLOW_FILES.get(filename);
    
    if (!object) {
      return new Response('File not found', { status: 404 });
    }

    // Get file metadata
    const headers = new Headers();
    
    // Set content type from R2 metadata
    if (object.httpMetadata?.contentType) {
      headers.set('Content-Type', object.httpMetadata.contentType);
    }
    
    if (object.httpMetadata?.contentDisposition) {
      headers.set('Content-Disposition', object.httpMetadata.contentDisposition);
    }

    // Set cache headers for static files
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('ETag', object.httpEtag);

    // Handle conditional requests
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (ifNoneMatch && ifNoneMatch === object.httpEtag) {
      return new Response(null, { status: 304, headers });
    }

    // Set CORS headers
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    // Return file content
    return new Response(object.body, {
      headers,
      status: 200
    });

  } catch (error) {
    console.error('File serving error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Handle HEAD requests for file metadata
export async function onRequestHead(context) {
  try {
    const { params, env } = context;
    const { filename } = params;

    if (!filename) {
      return new Response(null, { status: 400 });
    }

    const object = await env.WORKFLOW_FILES.head(filename);
    
    if (!object) {
      return new Response(null, { status: 404 });
    }

    const headers = new Headers();
    
    if (object.httpMetadata?.contentType) {
      headers.set('Content-Type', object.httpMetadata.contentType);
    }
    
    headers.set('Content-Length', object.size.toString());
    headers.set('ETag', object.httpEtag);
    headers.set('Last-Modified', object.uploaded.toUTCString());
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(null, { headers, status: 200 });

  } catch (error) {
    console.error('File head error:', error);
    return new Response(null, { status: 500 });
  }
}

// Handle CORS preflight
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, If-None-Match',
      'Access-Control-Max-Age': '86400',
    }
  });
}