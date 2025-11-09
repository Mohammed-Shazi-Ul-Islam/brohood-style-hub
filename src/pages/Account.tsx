import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User } from "lucide-react";
import logo from "@/assets/logo.png";

const Account = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userMeta, setUserMeta] = useState<{ email?: string; created_at?: string } | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        setUserMeta({
          email: session.user.email,
          created_at: session.user.created_at,
        });
      }
      setLoading(false);
    };
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  // ===========================================================
  // 🧍 Guest View (not logged in)
  // ===========================================================
  if (!session) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        {/* ✅ Logo top-left, larger */}
        <div className="absolute top-8 left-10">
          <Link to="/">
            <img
              src={logo}
              alt="BroHood Logo"
              className="h-32 w-auto object-contain" // 2× size
            />
          </Link>
        </div>

        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 text-center space-y-6">
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Welcome to BroHood
          </h1>
          <p className="text-gray-600 text-base">
            Sign in to view your orders, wishlist, and saved details.
          </p>

          <div className="flex flex-col gap-4 mt-6">
            <Link to="/login?redirect=/account">
              <Button className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-full">
                Sign In
              </Button>
            </Link>

            <Link to="/login?signup=true&redirect=/account">
              <Button
                variant="outline"
                className="w-full h-12 border-2 border-black text-black hover:bg-black hover:text-white font-medium rounded-full"
              >
                Create Account
              </Button>
            </Link>

            <Link to="/">
              <Button
                variant="outline"
                className="w-full h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================
  // 🧑 Logged-In Dashboard
  // ===========================================================
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      {/* ✅ Logo top-left, larger */}
      <div className="absolute top-8 left-10">
        <Link to="/">
          <img
            src={logo}
            alt="BroHood Logo"
            className="h-32 w-auto object-contain" // 2× bigger
          />
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 text-center space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner border border-gray-200 mb-4">
            <User className="h-12 w-12 text-gray-500" />
          </div>
        </div>

        <h2 className="text-3xl font-serif font-bold text-gray-900">
          My Account
        </h2>
        <p className="text-gray-600 text-base">
          Welcome back, {userMeta?.email?.split("@")[0]} 👋
        </p>

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left space-y-2 shadow-sm">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Email:</span> {userMeta?.email}
          </p>
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Member Since:</span>{" "}
            {new Date(userMeta?.created_at || "").toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <Link to="/">
            <Button
              variant="outline"
              className="w-full h-12 border-2 border-black text-black hover:bg-black hover:text-white rounded-full"
            >
              Continue Shopping
            </Button>
          </Link>

          <Button
            onClick={handleLogout}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full"
          >
            <LogOut className="mr-2 h-5 w-5" /> Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Account;
