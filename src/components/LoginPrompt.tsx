import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, SignIn } from '@phosphor-icons/react';

interface LoginPromptProps {
  onLoginClick: () => void;
  title?: string;
  description?: string;
}

export function LoginPrompt({ 
  onLoginClick,
  title = "Authentication Required",
  description = "Please sign in to access this feature"
}: LoginPromptProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Rocket size={48} className="text-accent" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={onLoginClick}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <SignIn size={16} className="mr-2" />
            Sign In to Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}