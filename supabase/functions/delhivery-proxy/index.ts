import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};

serve(async (req) => {
  console.log("Delhivery proxy function called with method:", req.method);
  console.log("Request headers:", [...req.headers.entries()]);
  console.log("Request URL:", req.url);
  
  // Handle CORS preflight - accept all methods
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("ok", {
      headers: corsHeaders
    });
  }

  // Accept GET method for all requests
  console.log("Accepting request method:", req.method);
  
  try {
    // For GET requests, parameters will be in query string
    // For POST requests, parameters will be in body
    let requestBody: any = {};
    let rawBody = "";
    
    if (req.method === "GET") {
      // For GET requests, extract parameters from query string
      const url = new URL(req.url);
      const searchParams = url.searchParams;
      
      // Convert query parameters to requestBody format
      const path = searchParams.get('path');
      const method = searchParams.get('method') || 'GET';
      
      requestBody = {
        path: path,
        method: method
      };
      
      console.log("GET request parameters:", requestBody);
    } else {
      // For POST/PUT requests, read from body
      try {
        rawBody = await req.text();
        console.log("Raw request body:", rawBody);
        
        if (rawBody) {
          requestBody = JSON.parse(rawBody);
        }
      } catch (parseError) {
        console.log("Request body is not JSON, treating as raw text");
        requestBody = { rawBody: rawBody };
      }
      
      console.log("Parsed request body:", requestBody);
    }
    
    // Check if this is our expected format
    const path = requestBody.path;
    const method = requestBody.method;
    
    // If we have a path, this is our expected format
    if (path) {
      console.log("Processing Delhivery API request");
      
      // Try to get the API key from environment variables
      // Use the actual API key from your curl command
      const apiKey = (globalThis as any).Deno?.env?.get("DELHIVERY_API_KEY") || "db825db6ab6c44b3e809520915801f5dbc205d92";
      if (!apiKey) {
        console.error("Delhivery API key not set in environment variables");
        console.log("Available environment variables:", Object.keys((globalThis as any).Deno?.env?.toObject() || {}));
        return new Response(JSON.stringify({
          error: "Internal Server Error",
          message: "DELHIVERY_API_KEY not configured in Supabase environment variables",
          detail: "Please set DELHIVERY_API_KEY in your Supabase project settings"
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }

      // Build the URL with query parameters for GET requests
      let url = `https://track.delhivery.com${path}`;
      
      // For GET requests, move parameters from query string to the final URL
      if (req.method === "GET") {
        const urlObj = new URL(req.url);
        const searchParams = new URLSearchParams(urlObj.searchParams);
        
        // Remove path and method from parameters as they're not for the Delhivery API
        searchParams.delete('path');
        searchParams.delete('method');
        
        // Add parameters to the Delhivery API URL
        if (searchParams.toString()) {
          url += (path.includes('?') ? '&' : '?') + searchParams.toString();
        }
      }
      
      console.log("Making request to Delhivery API:", { url, method: method || req.method });
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Token ${apiKey}`,
        "Accept": "application/json"
      };

      // Use the provided method or default to GET
      const requestMethod = (method?.toUpperCase() || "GET");

      const response = await fetch(url, {
        method: requestMethod,
        headers,
        // For GET requests, no body should be sent
        // For POST requests, use the body from the original request
        body: req.method !== "GET" && requestBody.body ? JSON.stringify(requestBody.body) : undefined
      });

      console.log("Delhivery API response status:", response.status);
      
      const textData = await response.text();
      console.log("Delhivery API response body:", textData.substring(0, 1000) + (textData.length > 1000 ? "..." : ""));
      
      // Try to parse the response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(textData);
      } catch (parseError) {
        console.log("Delhivery API response is not JSON, returning as text response");
        // If it's not JSON, return it as a text response with appropriate structure
        parsedResponse = {
          message: textData,
          success: response.status === 200,
          status: response.status
        };
      }
      
      console.log("Parsed Delhivery API response:", parsedResponse);

      return new Response(JSON.stringify(parsedResponse), {
        status: response.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    } else {
      // If no path, return a debug response
      console.log("Returning debug response");
      return new Response(JSON.stringify({
        message: "Delhivery proxy function is working",
        method: req.method,
        url: req.url,
        headers: [...req.headers.entries()],
        body: requestBody,
        envVars: Object.keys((globalThis as any).Deno?.env?.toObject() || {}).filter(key => key.includes('DELHIVERY') || key.includes('VITE'))
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
  } catch (err) {
    console.error("Delhivery proxy error:", err);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: err.message,
      stack: err.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});