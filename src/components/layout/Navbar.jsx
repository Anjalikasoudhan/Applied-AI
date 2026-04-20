import React from 'react';
import { Building2, Sparkles, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">Applied.AI</span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
          <Link to="/portfolio" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">My Portfolio</Link>
          <Link to="/history" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">History</Link>
          
          <div className="flex items-center gap-2 pl-4 border-l border-border">
            <button className="flex items-center justify-center h-9 w-9 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
              <UserCircle className="h-5 w-5 text-secondary-foreground" />
            </button>
            <div className="hidden md:flex items-center text-sm px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium tracking-wide border border-primary/20 shadow-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Intern Demo
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
