import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Lock, Copy } from '@phosphor-icons/react';
import { EveApiEndpoint, ApiResponse } from '@/lib/types';
import { makeApiRequest, validateParameters } from '@/lib/api-client';
import { toast } from 'sonner';

interface RequestBuilderProps {
  endpoint: EveApiEndpoint;
  onResponse: (response: ApiResponse) => void;
}

export function RequestBuilder({ endpoint, onResponse }: RequestBuilderProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleParameterChange = (name: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateParameters(endpoint, parameters);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const response = await makeApiRequest(endpoint, parameters);
      onResponse(response);
      toast.success('Request completed successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyUrl = () => {
    let url = `https://esi.evetech.net/latest${endpoint.path}`;
    
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
    
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const renderParameterInput = (param: any) => {
    const value = parameters[param.name] || '';

    if (param.name === 'order_type' && param.description?.includes('buy", "sell", "all')) {
      return (
        <Select value={value} onValueChange={(val) => handleParameterChange(param.name, val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select order type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Buy Orders</SelectItem>
            <SelectItem value="sell">Sell Orders</SelectItem>
            <SelectItem value="all">All Orders</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={param.type === 'integer' ? 'number' : 'text'}
        value={value}
        onChange={(e) => handleParameterChange(param.name, e.target.value)}
        placeholder={param.description || `Enter ${param.name}`}
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'} className="font-mono">
                {endpoint.method}
              </Badge>
              <code className="text-primary">{endpoint.path}</code>
              {endpoint.requiresAuth && <Lock size={16} className="text-muted-foreground" />}
            </CardTitle>
            <CardDescription>{endpoint.summary}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={copyUrl}>
            <Copy size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {endpoint.description && (
          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
        )}

        {endpoint.requiresAuth && (
          <Alert>
            <Lock size={16} />
            <AlertDescription>
              This endpoint requires authentication. You'll need to authenticate with EVE Online SSO to access this data.
            </AlertDescription>
          </Alert>
        )}

        {endpoint.parameters && endpoint.parameters.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Parameters</h4>
            {endpoint.parameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <Label htmlFor={param.name} className="flex items-center gap-2">
                  {param.name}
                  {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  <span className="text-xs text-muted-foreground">({param.type})</span>
                </Label>
                {renderParameterInput(param)}
                {param.description && (
                  <p className="text-xs text-muted-foreground">{param.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            'Making Request...'
          ) : (
            <>
              <Play size={16} className="mr-2" />
              Send Request
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}