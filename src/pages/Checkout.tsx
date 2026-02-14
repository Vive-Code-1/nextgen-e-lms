import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, CreditCard, ShieldCheck, Copy, Phone, MapPin, Truck, Eye, EyeOff, Tag, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface CourseData {
  title: string;
  price: number | null;
  discount_price: number | null;
  has_discount: boolean;
  is_free: boolean;
  image_url: string | null;
}

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

  const [course, setCourse] = useState<CourseData | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);

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

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Rate limit popup
  const [rateLimitOpen, setRateLimitOpen] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState("");

  // Checkout attempt tracking
  const attemptSavedRef = useRef(false);

  useEffect(() => {
    if (!slug) { setCourseLoading(false); return; }
    const fetchCourse = async () => {
      const { data } = await supabase
        .from("courses")
        .select("title, price, discount_price, has_discount, is_free, image_url")
        .eq("slug", slug)
        .maybeSingle();
      setCourse(data);
      setCourseLoading(false);
    };
    fetchCourse();
  }, [slug]);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.country_code === "BD") setIsBangladesh(true);
      })
      .catch(() => {});
  }, []);

  // Debounced checkout attempt save
  useEffect(() => {
    if (user) return; // Don't track logged-in users
    if (attemptSavedRef.current) return;
    if (!email && !phone) return;

    const timer = setTimeout(async () => {
      if (attemptSavedRef.current) return;
      attemptSavedRef.current = true;
      try {
        await supabase.functions.invoke("save-checkout-attempt", {
          body: {
            email: email || null,
            phone: phone || null,
            full_name: fullName || null,
            course_slug: slug || null,
            course_title: course?.title || null,
          },
        });
      } catch {}
    }, 3000);

    return () => clearTimeout(timer);
  }, [email, phone, fullName, slug, course?.title, user]);

  // Calculate effective price
  const coursePrice = course
    ? (course.has_discount && course.discount_price ? course.discount_price : (course.price || 0))
    : 0;

  // Calculate coupon discount
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? Math.round(coursePrice * appliedCoupon.discount_value / 100)
      : Math.min(appliedCoupon.discount_value, coursePrice)
    : 0;

  const finalPrice = Math.max(coursePrice - couponDiscount, 0);

  const isBdManual = ["bkash_manual", "nagad_manual", "rocket_manual"].includes(paymentMethod);
  const isCod = paymentMethod === "cod";
  const selectedBdMethod = bdManualMethods.find((m) => m.id === paymentMethod);

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    toast({ title: "কপি হয়েছে!", description: `${number} কপি করা হয়েছে` });
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponApplying(true);
    setCouponError("");
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) { setCouponError("কুপন কোড সঠিক নয়"); return; }

      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        setCouponError("এই কুপনের মেয়াদ শেষ হয়ে গেছে"); return;
      }
      if (data.max_uses && data.times_used >= data.max_uses) {
        setCouponError("এই কুপন সর্বোচ্চ ব্যবহার সীমায় পৌঁছেছে"); return;
      }
      if (data.min_order_amount && coursePrice < data.min_order_amount) {
        setCouponError(`সর্বনিম্ন অর্ডার ${currency}${data.min_order_amount} হতে হবে`); return;
      }

      setAppliedCoupon({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
      });
      toast({ title: "কুপন প্রয়োগ হয়েছে!", description: `${data.code} সফলভাবে যুক্ত হয়েছে` });
    } catch (err: any) {
      setCouponError(err.message || "কুপন যাচাই করতে সমস্যা হয়েছে");
    } finally {
      setCouponApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handlePayment = async () => {
    setError("");
    setLoading(true);

    try {
      if (isBdManual && (!senderPhone || !trxId)) {
        setError("পেমেন্ট নম্বর ও TrxID দিন");
        setLoading(false);
        return;
      }

      if (!user && (!email || !password || !fullName || !phone || !address)) {
        setError("সকল ফিল্ড পূরণ করুন");
        setLoading(false);
        return;
      }

      if (!course || !slug) throw new Error("Course not found");

      const { data, error: fnErr } = await supabase.functions.invoke("process-payment", {
        body: {
          course_slug: slug,
          payment_method: paymentMethod,
          amount: finalPrice,
          user_id: user?.id || undefined,
          course_title: course.title,
          full_name: fullName || user?.user_metadata?.full_name || "Customer",
          email: email || user?.email || "",
          password: !user ? password : undefined,
          phone: phone || undefined,
          address: address || undefined,
          sender_phone: isBdManual ? senderPhone : undefined,
          trx_id: isBdManual ? trxId : undefined,
          coupon_code: appliedCoupon?.code || undefined,
          coupon_discount: couponDiscount || undefined,
        },
      });

      // Handle non-2xx responses - check if it's a rate limit
      if (fnErr) {
        if (data?.error === "rate_limit") {
          setRateLimitMessage(data.message);
          setRateLimitOpen(true);
          setLoading(false);
          return;
        }
        throw fnErr;
      }

      if (data?.error) throw new Error(data.error);

      if (data?.user_email && data?.user_password && !user) {
        await supabase.auth.signInWithPassword({
          email: data.user_email,
          password: data.user_password,
        });
      }

      if (data?.redirect_url) {
        if (data?.user_email) {
          localStorage.setItem('checkout_credentials', JSON.stringify({
            email: data.user_email,
            password: data.user_password
          }));
        }
        window.location.href = data.redirect_url;
        return;
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

  if (courseLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-28">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

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
                        <p className="text-xs text-muted-foreground mt-2">উপরের নম্বরে {currency}{finalPrice} টাকা Send Money করুন</p>
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
                  {loading ? "Processing..." : isCod ? "অর্ডার করুন" : `Pay ${currency}${finalPrice}`}
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
                    <img src={course.image_url || "/placeholder.svg"} alt={course.title} className="w-full h-40 object-cover" />
                  </div>
                  <h3 className="font-semibold text-foreground">{course.title}</h3>
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Course Price</span>
                      <span className="font-medium text-foreground">{currency}{coursePrice}</span>
                    </div>
                    {course.has_discount && course.discount_price && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Original Price</span>
                        <span className="font-medium text-muted-foreground line-through">{currency}{course.price}</span>
                      </div>
                    )}

                    {/* Coupon Section */}
                    {!appliedCoupon ? (
                      <div className="pt-2">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="কুপন কোড"
                              value={couponCode}
                              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                              className="pl-10 text-sm"
                            />
                          </div>
                          <Button size="sm" onClick={applyCoupon} disabled={couponApplying || !couponCode.trim()} variant="outline">
                            {couponApplying ? "..." : "Apply"}
                          </Button>
                        </div>
                        {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-sm bg-emerald-500/10 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium text-emerald-600">{appliedCoupon.code}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-emerald-600">-{currency}{couponDiscount}</span>
                          <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium text-foreground">{currency}0.00</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-extrabold text-primary text-xl">{currency}{finalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Rate Limit Popup */}
      <AlertDialog open={rateLimitOpen} onOpenChange={setRateLimitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ অর্ডার সীমা অতিক্রম</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {rateLimitMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 sm:justify-center">
            <a href="https://wa.me/8801332052874" target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white">WhatsApp</Button>
            </a>
            <a href="https://facebook.com/digitaltechdude" target="_blank" rel="noopener noreferrer">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Facebook</Button>
            </a>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Checkout;
