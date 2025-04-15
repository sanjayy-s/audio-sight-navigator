
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye } from 'lucide-react';

const WelcomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/10 to-background">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="bg-primary text-primary-foreground w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Eye className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              THIRD EYE
            </h1>
            <p className="text-xl text-muted-foreground">
              AI-powered vision to enhance independence and mobility
            </p>
          </div>

          <div className="space-y-6 pt-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-sm">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Object Detection</h3>
                  <p className="text-sm text-muted-foreground">Identifies objects in your surroundings</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-sm">
                <div className="bg-primary/10 p-2 rounded-full">
                  <svg className="h-5 w-5 text-primary" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 0C7.77614 0 8 0.223858 8 0.5V2.5C8 2.77614 7.77614 3 7.5 3C7.22386 3 7 2.77614 7 2.5V0.5C7 0.223858 7.22386 0 7.5 0ZM2.1967 2.1967C2.39196 2.00144 2.70854 2.00144 2.90381 2.1967L4.31802 3.61091C4.51328 3.80617 4.51328 4.12276 4.31802 4.31802C4.12276 4.51328 3.80617 4.51328 3.61091 4.31802L2.1967 2.90381C2.00144 2.70854 2.00144 2.39196 2.1967 2.1967ZM0 7.5C0 7.22386 0.223858 7 0.5 7H2.5C2.77614 7 3 7.22386 3 7.5C3 7.77614 2.77614 8 2.5 8H0.5C0.223858 8 0 7.77614 0 7.5ZM2.1967 12.8033C2.00144 12.608 2.00144 12.2915 2.1967 12.0962L3.61091 10.682C3.80617 10.4867 4.12276 10.4867 4.31802 10.682C4.51328 10.8772 4.51328 11.1938 4.31802 11.3891L2.90381 12.8033C2.70854 12.9986 2.39196 12.9986 2.1967 12.8033ZM12.8033 2.1967C12.9986 2.39196 12.9986 2.70854 12.8033 2.90381L11.3891 4.31802C11.1938 4.51328 10.8772 4.51328 10.682 4.31802C10.4867 4.12276 10.4867 3.80617 10.682 3.61091L12.0962 2.1967C12.2915 2.00144 12.608 2.00144 12.8033 2.1967ZM15 7.5C15 7.77614 14.7761 8 14.5 8H12.5C12.2239 8 12 7.77614 12 7.5C12 7.22386 12.2239 7 12.5 7H14.5C14.7761 7 15 7.22386 15 7.5ZM12.8033 12.8033C12.608 12.9986 12.2915 12.9986 12.0962 12.8033L10.682 11.3891C10.4867 11.1938 10.4867 10.8772 10.682 10.682C10.8772 10.4867 11.1938 10.4867 11.3891 10.682L12.8033 12.0962C12.9986 12.2915 12.9986 12.608 12.8033 12.8033ZM8 12.5C8 12.7761 7.77614 13 7.5 13C7.22386 13 7 12.7761 7 12.5V10.5C7 10.2239 7.22386 10 7.5 10C7.77614 10 8 10.2239 8 10.5V12.5ZM10.0005 7.5C10.0005 8.88071 8.88121 10 7.5005 10C6.11979 10 5.0005 8.88071 5.0005 7.5C5.0005 6.11929 6.11979 5 7.5005 5C8.88121 5 10.0005 6.11929 10.0005 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Audio Feedback</h3>
                  <p className="text-sm text-muted-foreground">Provides sound alerts based on proximity</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-sm">
                <div className="bg-primary/10 p-2 rounded-full">
                  <svg className="h-5 w-5 text-primary" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 1.5C5 1.22386 4.77614 1 4.5 1C4.22386 1 4 1.22386 4 1.5L4 13.5C4 13.7761 4.22386 14 4.5 14C4.77614 14 5 13.7761 5 13.5V1.5ZM11 1.5C11 1.22386 10.7761 1 10.5 1C10.2239 1 10 1.22386 10 1.5V13.5C10 13.7761 10.2239 14 10.5 14C10.7761 14 11 13.7761 11 13.5V1.5ZM7.5 4C7.77614 4 8 3.77614 8 3.5C8 3.22386 7.77614 3 7.5 3C7.22386 3 7 3.22386 7 3.5C7 3.77614 7.22386 4 7.5 4ZM8 7.5C8 7.77614 7.77614 8 7.5 8C7.22386 8 7 7.77614 7 7.5C7 7.22386 7.22386 7 7.5 7C7.77614 7 8 7.22386 8 7.5ZM7.5 12C7.77614 12 8 11.7761 8 11.5C8 11.2239 7.77614 11 7.5 11C7.22386 11 7 11.2239 7 11.5C7 11.7761 7.22386 12 7.5 12Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Customizable Settings</h3>
                  <p className="text-sm text-muted-foreground">Adjust detection sensitivity and audio preferences</p>
                </div>
              </div>
            </div>

            <Link to="/camera" className="block w-full">
              <Button className="w-full gap-2 py-6 text-lg" size="lg">
                Get Started <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="bg-muted p-4 text-center text-sm text-muted-foreground">
        <p>THIRD EYE - Enhancing mobility for visually impaired users</p>
      </footer>
    </div>
  );
};

export default WelcomePage;
