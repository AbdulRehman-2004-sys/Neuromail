import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  console.log(seed)
  const handleLogin = async () => {
    setError("");
    if (!seed.trim()) {
      setError("Please enter your seed phrase.");
      return;
    }

    try {
      setLoading(true);

      // 🔑 POST to NeuroMail API using fetch
      const res = await fetch(
        "https://dev.api.neuromail.space/api/user/generate-token/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pass_phrase: seed.trim() }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Login successful:", data);
      const { access } = data;

      // Save token for later use
      localStorage.setItem("accessToken", access);

      // ✅ Toastify welcome message
      toast.success(
        `Welcome to the Dashboard! 🎉`,
        { position: "top-right", autoClose: 3000 }
      );

      // Navigate to dashboard
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Check your seed phrase.");
      toast.error("Login failed. Please check your seed phrase.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="w-full h-screen absolute top-0 left-0 block md:hidden bg-[rgba(0,0,255,0.5)]"></div>
      {/* Navbar */}
      <img className="w-52 mb-8 z-50" src="https://mailing.neuromail.digital/logoName.svg" alt="" />

      {/* Card */}

      <div className="w-full h-auto md:h-[80vh] z-50 max-w-5xl rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden md:bg-[url('/bg.png')]"
        >
        {/* Left side */}
        <div className="p-8 flex flex-col justify-center md:bg-[rgba(0,0,255,0.5)] bg-cover bg-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Login Neuromail Account
          </h2>
          <p className="text-gray-200 text-sm md:text-base leading-relaxed">
            Login with your seed , We do the heavy lifting in a non-sense , ad-free, tracker-free and cloud-free manner. Free and open source.
          </p>
        </div>

        {/* Right side */}
        <div className="p-8 flex flex-col justify-center bg-gray-100 text-gray-900">
          <label className="font-semibold text-sm mb-2">Key Seed</label>
          <textarea
            placeholder="Enter your Key Seeds..."
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded-md transition"
          >
            {loading ? "Logging in..." : "Next"}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
          )}
          <p className="mt-3 text-center text-sm">
            Don’t have your seed?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 z-50 text-xs text-gray-400">
        ©Neuronus <span className="ml-2">v2.23.21</span>
      </div>
    </div>
  );
}
