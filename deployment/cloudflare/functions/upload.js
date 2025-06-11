/**
 * Cloudflare Pages Function for file uploads
 * Handles file uploads to R2 Object Storage
 */

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Check authentication (implement your auth logic)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !file.size) {
      return new Response(JSON.stringify({ 
        error: 'No file provided or file is empty' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ 
        error: 'File too large. Maximum size is 10MB' 
      }), { 
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/csv', 'application/json',
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ 
        error: 'File type not allowed' 
      }), { 
        status: 415,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomId}.${extension}`;

    // Upload to R2
    await env.WORKFLOW_FILES.put(fileName, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `attachment; filename="${file.name}"`,
      },
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        size: file.size.toString(),
      }
    });

    // Store file metadata in D1 database
    try {
      const stmt = env.WORKFLOW_DB.prepare(`
        INSERT INTO files (id, original_name, stored_name, file_type, file_size, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const fileId = crypto.randomUUID();
      await stmt.bind(
        fileId,
        file.name,
        fileName,
        file.type,
        file.size,
        new Date().toISOString()
      ).run();

      return new Response(JSON.stringify({
        success: true,
        fileId,
        fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: `/files/${fileName}`,
        uploadedAt: new Date().toISOString()
      }), {
        status: 201,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      // File uploaded to R2 but database failed - could implement cleanup
      return new Response(JSON.stringify({
        success: true,
        fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: `/files/${fileName}`,
        warning: 'File uploaded but metadata storage failed'
      }), {
        status: 201,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Upload failed',
      details: error.message 
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
  });
}