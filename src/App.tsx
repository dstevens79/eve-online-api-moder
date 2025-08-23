import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { Globe, Code, ExternalLink } from '@phosphor-icons/react';
import { EndpointBrowser } from '@/components/EndpointBrowser';
import { RequestBuilder } from '@/components/RequestBuilder';
import { ResponseViewer } from '@/components/ResponseViewer';
import { Sidebar } from '@/components/Sidebar';
import { EveApiEndpoint, ApiResponse, RequestHistory } from '@/lib/types';
import { useKV } from '@github/spark/hooks';

function App() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EveApiEndpoint | null>(null);
  const [currentResponse, setCurrentResponse] = useState<ApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState('browser');
  const [history, setHistory] = useKV<RequestHistory[]>('request-history', []);

  const handleSelectEndpoint = (endpoint: EveApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setActiveTab('request');
    setCurrentResponse(null);
  };

  const handleResponse = (response: ApiResponse) => {
    setCurrentResponse(response);
    setActiveTab('response');
    
    // Add to history
    if (selectedEndpoint) {
      const historyItem: RequestHistory = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        endpoint: selectedEndpoint,
        parameters: {},
        response,
        timestamp: Date.now()
      };
      
      setHistory((current) => {
        const newHistory = [historyItem, ...current];
        return newHistory.slice(0, 50); // Keep only last 50 items
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Globe size={24} className="text-primary" />
                <h1 className="text-xl font-bold">EVE Online API Explorer</h1>
              </div>
              <Badge variant="secondary" className="text-xs">
                ESI Latest
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://docs.esi.evetech.net/', '_blank')}
              >
                <Code size={16} className="mr-2" />
                API Docs
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://developers.eveonline.com/', '_blank')}
              >
                <ExternalLink size={16} className="mr-2" />
                Developers
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar onSelectEndpoint={handleSelectEndpoint} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!selectedEndpoint ? (
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to EVE Online API Explorer</CardTitle>
                  <CardDescription>
                    Explore and test the EVE Online ESI (EVE Swagger Interface) API endpoints. 
                    Browse categories, make requests, and view formatted responses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg border">
                      <h3 className="font-medium mb-2">🚀 Get Started</h3>
                      <p className="text-sm text-muted-foreground">
                        Browse the API endpoints below or use the search to find specific functionality.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <h3 className="font-medium mb-2">🔒 Authentication</h3>
                      <p className="text-sm text-muted-foreground">
                        Some endpoints require EVE Online SSO authentication for character-specific data.
                      </p>
                    </div>
                  </div>
                  
                  <EndpointBrowser onSelectEndpoint={handleSelectEndpoint} />
                </CardContent>
              </Card>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="browser">Browse</TabsTrigger>
                  <TabsTrigger value="request">Request</TabsTrigger>
                  <TabsTrigger value="response" disabled={!currentResponse}>
                    Response
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="browser">
                  <EndpointBrowser onSelectEndpoint={handleSelectEndpoint} />
                </TabsContent>

                <TabsContent value="request">
                  {selectedEndpoint && (
                    <RequestBuilder
                      endpoint={selectedEndpoint}
                      onResponse={handleResponse}
                    />
                  )}
                </TabsContent>

                <TabsContent value="response">
                  {currentResponse && (
                    <ResponseViewer response={currentResponse} />
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;