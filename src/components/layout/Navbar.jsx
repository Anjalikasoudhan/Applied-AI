import React from 'react';
import { Building2, Sparkles, UserCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
const Navbar = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center text-sm px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-medium tracking-wide border border-border shadow-sm gap-2">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-5 h-5 rounded-full" />
                  ) : (
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span>{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/auth" className="flex items-center text-sm px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
