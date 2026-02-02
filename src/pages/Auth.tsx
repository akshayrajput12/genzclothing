import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          throw new Error("Please fill in all fields.");
        }
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        navigate('/');
      } else {
        if (!formData.email || !formData.password || !formData.fullName || !formData.confirmPassword) {
          throw new Error("Please fill in all fields.");
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters long.");
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) throw error;

        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <main className="flex min-h-screen font-sans bg-background">
      {/* Left Side - Image Board */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          alt="Modern ethnic fashion photography"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQzo0c40wI9hgAa-0rONolls_Od8LYzUi7q8e2cMEzguG0NiJd9JKfUbWAU21JFZpJ7ubJS6W5Xd7mT9QSrP7bdMUTtgEze3H_cEJGsjcftZPHCHECD_jYLYYQsRH0tmAb6Jh5ReBUOWh3Xz1nXuqDFkS88OrXCQ1q13bpcILP99PBKxEqXr6_o_U9q8VuWbBgR0iblIg1S5s_rQnNz-ie3x1zFOjQe1k60sNHYfeIBs0jkRMm9fLXrsz0ARK1_Oo3_dUMpTxz18jm"
        />
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-display font-light tracking-tight mb-4">Timeless Tradition <br />meets Modern Grace.</h2>
          <p className="text-lg opacity-90 font-light max-w-md">Discover curated ethnic wear that speaks to your unique style and heritage.</p>
        </div>
        <div className="absolute top-12 left-12">
          <span className="text-2xl font-bold tracking-tighter text-white">PARIDHAN <span className="text-primary font-serif italic">HAAT</span></span>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 relative bg-background">
        <Link
          to="/"
          className="absolute top-8 right-8 lg:top-12 lg:right-12 flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity text-foreground"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Home
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-display font-semibold mb-2 text-foreground">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? 'Sign in to your account to start shopping.' : 'Join us to explore timeless fashion.'}
            </p>
          </div>

          <div className="bg-secondary/10 dark:bg-neutral-800 p-1.5 rounded-2xl flex mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${isLogin
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${!isLogin
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Sign Up
            </button>
          </div>



          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1" htmlFor="fullName">Full Name</label>
                <input
                  className="w-full px-5 py-4 bg-secondary/10 dark:bg-neutral-900 border-none rounded-xl focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                  id="fullName"
                  placeholder="Enter your full name"
                  type="text"
                  onChange={handleInputChange}
                  value={formData.fullName}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1" htmlFor="email">Email Address</label>
              <input
                className="w-full px-5 py-4 bg-secondary/10 dark:bg-neutral-900 border-none rounded-xl focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                id="email"
                placeholder="hello@example.com"
                type="email"
                onChange={handleInputChange}
                value={formData.email}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1" htmlFor="password">Password</label>
                {isLogin && <a className="text-xs font-medium text-primary hover:underline" href="#">Forgot password?</a>}
              </div>
              <input
                className="w-full px-5 py-4 bg-secondary/10 dark:bg-neutral-900 border-none rounded-xl focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                id="password"
                placeholder="Enter your password"
                type="password"
                onChange={handleInputChange}
                value={formData.password}
              />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 ml-1" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  className="w-full px-5 py-4 bg-secondary/10 dark:bg-neutral-900 border-none rounded-xl focus:ring-2 focus:ring-primary text-foreground transition-all outline-none"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  type="password"
                  onChange={handleInputChange}
                  value={formData.confirmPassword}
                />
              </div>
            )}

            <button className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/10 mt-2 flex justify-center items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            {isLogin ? "New to Paridhan Haat? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </p>

          <div className="mt-12 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              By signing in, you agree to our <a className="underline hover:text-foreground" href="#">Terms of Service</a> & <a className="underline hover:text-foreground" href="#">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>


    </main>
  );
}