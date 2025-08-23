interface EveApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  summary: string;
  description?: string;
  parameters?: Array<{
    name: string;
    in: 'path' | 'query' | 'body';
    required: boolean;
    type: string;
    description?: string;
  }>;
  requiresAuth: boolean;
  category: string;
}

interface EveApiCategory {
  name: string;
  description: string;
  endpoints: EveApiEndpoint[];
}

interface ApiResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
  timestamp: number;
}

interface RequestHistory {
  id: string;
  endpoint: EveApiEndpoint;
  parameters: Record<string, any>;
  response: ApiResponse;
  timestamp: number;
}

export type { EveApiEndpoint, EveApiCategory, ApiResponse, RequestHistory };