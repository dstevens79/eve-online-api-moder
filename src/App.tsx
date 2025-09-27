import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Rocket, Sparkles, Code, Palette } from '@phosphor-icons/react'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-accent/20 rounded-full">
              <Rocket size={48} className="text-accent" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">Welcome to Your Spark</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your spark has been successfully created! This is a blank canvas ready for your ideas.
            Start building something amazing.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code size={20} className="text-accent" />
                Ready to Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built with React, TypeScript, and Tailwind CSS. All the tools you need are already configured.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette size={20} className="text-accent" />
                Beautiful UI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Includes shadcn/ui components and a carefully crafted design system for professional apps.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={20} className="text-accent" />
                Spark Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built-in authentication, key-value storage, and AI integration ready to use.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Section */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">What's Next?</h2>
          <p className="text-muted-foreground">
            Start customizing your app by editing the App.tsx file
          </p>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Get Started
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Built with Spark • Ready to deploy
          </p>
        </div>
      </div>
    </div>
  )
}