import { EveApiEndpoint, ApiResponse } from './types';
import { EVE_API_BASE_URL } from './api-data';

export async function makeApiRequest(
  endpoint: EveApiEndpoint, 
  parameters: Record<string, any> = {},
  accessToken?: string
): Promise<ApiResponse> {
  let url = EVE_API_BASE_URL + endpoint.path;
  
  // Replace path parameters
  const pathParams = endpoint.parameters?.filter(p => p.in === 'path') || [];
  for (const param of pathParams) {
    if (parameters[param.name]) {
      url = url.replace(`{${param.name}}`, parameters[param.name]);
    }
  }
  
  // Add query parameters
  const queryParams = endpoint.parameters?.filter(p => p.in === 'query') || [];
  const searchParams = new URLSearchParams();
  for (const param of queryParams) {
    if (parameters[param.name] !== undefined && parameters[param.name] !== '') {
      searchParams.append(param.name, parameters[param.name]);
    }
  }
  
  if (searchParams.toString()) {
    url += '?' + searchParams.toString();
  }
  
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  
  if (endpoint.requiresAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const requestOptions: RequestInit = {
    method: endpoint.method,
    headers,
  };
  
  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();
    
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    return {
      status: response.status,
      data,
      headers: responseHeaders,
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validateParameters(endpoint: EveApiEndpoint, parameters: Record<string, any>): string[] {
  const errors: string[] = [];
  
  const requiredParams = endpoint.parameters?.filter(p => p.required) || [];
  
  for (const param of requiredParams) {
    if (!parameters[param.name] || parameters[param.name] === '') {
      errors.push(`${param.name} is required`);
    }
  }
  
  return errors;
}