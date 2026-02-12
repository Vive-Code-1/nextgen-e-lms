import { useLocation, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, LogIn } from "lucide-react";

const ThankYou = () => {
  const location = useLocation();
  // Check location.state first (COD/manual), then localStorage (gateway redirects)
  const locState = location.state as { email?: string; password?: string } | null;
  const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('checkout_credentials') || 'null') : null;
  const state = locState || stored;
  // Clear localStorage after reading
  if (stored) localStorage.removeItem('checkout_credentials');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-28">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">ধন্যবাদ! আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে</h1>
            <p className="text-muted-foreground">
              আপনার পেমেন্ট ভেরিফিকেশনের জন্য পেন্ডিং আছে। অ্যাডমিন ভেরিফাই করলে আপনার কোর্স অ্যাক্সেস পাবেন।
            </p>

            {state?.email && (
              <div className="bg-muted rounded-xl p-4 space-y-2 text-left">
                <p className="text-sm font-semibold text-foreground">আপনার একাউন্ট তৈরি হয়েছে:</p>
                <div className="text-sm">
                  <span className="text-muted-foreground">ইমেইল: </span>
                  <span className="font-medium text-foreground">{state.email}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">পাসওয়ার্ড: </span>
                  <span className="font-medium text-foreground">{state.password}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  আপনার একাউন্ট এর ইমেইল ও পাসওয়ার্ড দিয়ে লগিন করে আপনার অর্ডার স্ট্যাটাস দেখুন।
                </p>
              </div>
            )}

            <Link to="/auth">
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                <LogIn className="h-4 w-4" />
                স্টুডেন্ট লগিন
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;
