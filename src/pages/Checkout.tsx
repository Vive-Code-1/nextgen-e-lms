import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, CreditCard, ShieldCheck, Copy, Phone, MapPin, Truck, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const bdManualMethods = [
  { id: "bkash_manual", label: "বিকাশ", number: "01332052874", color: "#E2136E" },
  { id: "nagad_manual", label: "নগদ", number: "01332052874", color: "#F6A21E" },
  { id: "rocket_manual", label: "রকেট", number: "01332052874", color: "#8C3494" },
];

const Checkout = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const currency = language === "en" ? "$" : "৳";

  const course = slug ? coursePrices[slug] : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("uddoktapay");
  const [senderPhone, setSenderPhone] = useState("");
  const [trxId, setTrxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isBangladesh, setIsBangladesh] = useState(false);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.country_code === "BD") setIsBangladesh(true);
      })
      .catch(() => {});
  }, []);

  const isBdManual = ["bkash_manual", "nagad_manual", "rocket_manual"].includes(paymentMethod);
  const isCod = paymentMethod === "cod";
  const selectedBdMethod = bdManualMethods.find((m) => m.id === paymentMethod);

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    toast({ title: "কপি হয়েছে!", description: `${number} কপি করা হয়েছে` });
  };

  const handlePayment = async () => {
    setError("");
    setLoading(true);

    try {
      // Validate BD manual fields
      if (isBdManual && (!senderPhone || !trxId)) {
        setError("পেমেন্ট নম্বর ও TrxID দিন");
        setLoading(false);
        return;
      }

      // Validate form for non-logged-in users
      if (!user && (!email || !password || !fullName || !phone || !address)) {
        setError("সকল ফিল্ড পূরণ করুন");
        setLoading(false);
        return;
      }

      if (!course || !slug) throw new Error("Course not found");

      // Call edge function - it handles EVERYTHING (user creation + order + payment)
      const { data, error: fnErr } = await supabase.functions.invoke("process-payment", {
        body: {
          course_slug: slug,
          payment_method: paymentMethod,
          amount: course.price,
          user_id: user?.id || undefined,
          course_title: course.title,
          full_name: fullName || user?.user_metadata?.full_name || "Customer",
          email: email || user?.email || "",
          password: !user ? password : undefined,
          phone: phone || undefined,
          address: address || undefined,
          sender_phone: isBdManual ? senderPhone : undefined,
          trx_id: isBdManual ? trxId : undefined,
        },
      });

      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);

      // Auto-login if new user was created by the edge function
      if (data?.user_email && data?.user_password && !user) {
        await supabase.auth.signInWithPassword({
          email: data.user_email,
          password: data.user_password,
        });
      }

      if (data?.redirect_url) {
        window.open(data.redirect_url, '_blank');
        navigate("/thank-you", {
          state: data?.user_email ? { email: data.user_email, password: data.user_password } : undefined,
        });
      } else if (data?.success || isCod) {
        navigate("/thank-you", {
          state: data?.user_email ? { email: data.user_email, password: data.user_password } : undefined,
        });
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন");
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
              <div className="lg:col-span-2 space-y-6">
                {/* Account Section */}
                {!user && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Create Your Account</h2>
                    <p className="text-sm text-muted-foreground mb-4">Create an account to access your course after purchase.</p>
                    <div className="space-y-3">
                      <Input placeholder="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                      <Input type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Password (min 6 characters) *" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required className="pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" required />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <textarea
                          placeholder="Address *"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm min-h-[80px]"
                          required
                        />
                      </div>
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
                        <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary" />
                        <div>
                          <span className="font-semibold text-foreground">{method.label}</span>
                          <p className="text-xs text-muted-foreground">{method.desc}</p>
                        </div>
                      </label>
                    ))}

                    {/* COD */}
                    <label
                      className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    >
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary" />
                      <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <span className="font-semibold text-foreground">Cash on Delivery</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* BD Manual Payment */}
                {isBangladesh && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">BD Manual Payment</h2>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {bdManualMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 border-2 rounded-xl text-center font-bold transition-all ${paymentMethod === method.id ? "border-primary shadow-lg scale-[1.02]" : "border-border hover:border-primary/50"}`}
                        style={paymentMethod === method.id ? { borderColor: method.color, backgroundColor: `${method.color}10` } : {}}
                      >
                        <span className="text-lg" style={{ color: method.color }}>{method.label}</span>
                      </button>
                    ))}
                  </div>

                  {isBdManual && selectedBdMethod && (
                    <div className="space-y-4 border-t border-border pt-4">
                      <div className="bg-muted rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-1">{selectedBdMethod.label} নম্বর:</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-foreground">{selectedBdMethod.number}</span>
                          <button
                            onClick={() => copyNumber(selectedBdMethod.number)}
                            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                          >
                            <Copy className="h-4 w-4 text-primary" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">উপরের নম্বরে {currency}{course.price} টাকা Send Money করুন</p>
                      </div>
                      <Input
                        placeholder="যে নম্বর থেকে পাঠিয়েছেন *"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Transaction ID (TrxID) *"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
                )}

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
                  {loading ? "Processing..." : isCod ? "অর্ডার করুন" : `Pay ${currency}${course.price}`}
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
