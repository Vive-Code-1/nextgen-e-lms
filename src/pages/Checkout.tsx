import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, CreditCard, ShieldCheck } from "lucide-react";

// Simple course price lookup matching CourseDetails data
const coursePrices: Record<string, { title: string; price: number; image: string }> = {
  "complete-graphics-design-masterclass": { title: "Complete Graphics Design Masterclass", price: 49.99, image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop" },
  "professional-video-editing-with-premiere-pro": { title: "Professional Video Editing with Premiere Pro", price: 44.99, image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop" },
  "digital-marketing-social-media-strategy": { title: "Digital Marketing & Social Media Strategy", price: 59.99, image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop" },
  "seo-mastery-rank-1-on-google": { title: "SEO Mastery: Rank #1 on Google", price: 39.99, image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&h=250&fit=crop" },
  "full-stack-web-development-bootcamp": { title: "Full-Stack Web Development Bootcamp", price: 54.99, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop" },
  "dropshipping-business-from-scratch": { title: "Dropshipping Business from Scratch", price: 34.99, image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop" },
  "advanced-graphics-design-portfolio": { title: "Advanced Graphics Design Portfolio", price: 54.99, image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop" },
  "full-stack-javascript-development": { title: "Full Stack JavaScript Development", price: 64.99, image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop" },
};

const Checkout = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const currency = language === "en" ? "$" : "৳";

  const course = slug ? coursePrices[slug] : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("uddoktapay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setError("");
    setLoading(true);

    try {
      let currentUser = user;

      // If not logged in, create account first
      if (!currentUser) {
        if (!email || !password || !fullName) {
          setError("Please fill in all account fields");
          setLoading(false);
          return;
        }
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
        });
        if (signUpErr) throw signUpErr;
        currentUser = data.user;
      }

      if (!currentUser || !course || !slug) throw new Error("Missing data");

      // Call payment edge function
      const { data, error: fnErr } = await supabase.functions.invoke("process-payment", {
        body: {
          course_slug: slug,
          payment_method: paymentMethod,
          amount: course.price,
          user_id: currentUser.id,
          course_title: course.title,
        },
      });

      if (fnErr) throw fnErr;

      if (data?.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        // For demo: create order and enrollment directly
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-28">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Course Not Found</h1>
            <Link to="/courses"><Button>Back to Courses</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="gradient-section pt-28 pb-12">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
              <Link to="/" className="hover:text-white transition-colors">{t("nav.home")}</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">Checkout</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Checkout</h1>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-[80vw] mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Account + Payment */}
              <div className="lg:col-span-2 space-y-6">
                {/* Account Section */}
                {!user && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Create Your Account</h2>
                    <p className="text-sm text-muted-foreground mb-4">Create an account to access your course after purchase.</p>
                    <div className="space-y-3">
                      <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <Input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
                    </div>
                  </div>
                )}

                {user && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-foreground mb-2">Account</h2>
                    <p className="text-muted-foreground">Logged in as <strong>{user.email}</strong></p>
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    {[
                      { id: "uddoktapay", label: "UddoktaPay", desc: "bKash, Nagad, Rocket & more" },
                      { id: "stripe", label: "Stripe", desc: "Credit/Debit Card" },
                      { id: "paypal", label: "PayPal", desc: "Pay with PayPal" },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="accent-primary"
                        />
                        <div>
                          <span className="font-semibold text-foreground">{method.label}</span>
                          <p className="text-xs text-muted-foreground">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg font-bold py-6"
                >
                  {loading ? "Processing..." : `Pay ${currency}${course.price}`}
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Secure payment powered by industry-standard encryption</span>
                </div>
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 space-y-4">
                  <h2 className="text-xl font-bold text-foreground">Order Summary</h2>
                  <div className="rounded-xl overflow-hidden border border-border">
                    <img src={course.image} alt={course.title} className="w-full h-40 object-cover" />
                  </div>
                  <h3 className="font-semibold text-foreground">{course.title}</h3>
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Course Price</span>
                      <span className="font-medium text-foreground">{currency}{course.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium text-foreground">{currency}0.00</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-extrabold text-primary text-xl">{currency}{course.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
