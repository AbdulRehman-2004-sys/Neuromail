import { useState } from "react";
import { FaEnvelope, FaExclamationTriangle, FaCopy, FaSeedling } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate for redirect
import { toast } from "react-toastify";

export default function Register() {
  const [step, setStep] = useState(1);
  const [seedWords, setSeedWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSeedFromAPI = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://dev.api.neuromail.space/api/user/generate-pass-phrase/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }
      );

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      const passPhrase = data?.pass_phrase || "";
      setSeedWords(passPhrase.trim().split(/\s+/));
      setStep(2);
    } catch (err) {
      console.error("Failed to generate pass phrase:", err.message);
      toast.error("❌ Could not generate seed phrase. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnderstand = () => fetchSeedFromAPI();

  const handleCopy = () => {
    navigator.clipboard.writeText(seedWords.join(" "));
    toast.success("📋 Seed copied to clipboard!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // ✅ Generate token on Next button
  const handleNext = async () => {
    try {
      const response = await fetch("https://dev.api.neuromail.space/api/user/generate-token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass_phrase: seedWords.join(" ") }), // sending passphrase
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();
      console.log(data)
      const token = data?.access;

      if (token) {
        localStorage.setItem("accessToken", token);
        navigate("/create-mail", { replace: true });  // redirect
      }
    } catch (err) {
      console.error("Token error:", err.message);
      toast.error("❌ Could not generate token.");
    }
  };

  return (
    <div className="login min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">

      <div className="w-full h-screen absolute top-0 left-0 block md:hidden bg-[rgba(0,0,255,0.5)]"></div>
      {/* Navbar */}
      <img className="w-52 mb-8 z-50" src="https://mailing.neuromail.digital/logoName.svg" alt="" />

      {/* Card */}
      <div className="w-full h-auto md:h-[80vh] max-w-5xl rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden z-50 md:bg-[url('/bg.png')]"
      >
        {/* Left Side */}
        <div className="p-8 flex flex-col justify-center md:bg-[rgba(0,0,255,0.5)] bg-cover bg-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Create Your Neuromail Account
          </h2>
          <p className="text-gray-200 text-sm md:text-base">
            Register securely with a generated seed phrase.
          </p>
        </div>

        {/* Right Side */}
        <div className="p-8 flex flex-col justify-center bg-gray-100 text-gray-900">
          {step === 1 ? (
            <>
              <div className="flex flex-col items-center mb-4">
                <FaExclamationTriangle className="text-4xl text-gray-700 mb-2" />
                <h2 className="text-xl font-bold">Important Note</h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-6">
                On the next page you will see a secure seed phrase. This is the ONLY
                way to recover your account. Store it safely.
              </p>
              <button
                onClick={handleUnderstand}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition disabled:bg-blue-400"
              >
                {loading ? "Generating..." : "I understand, show me my seed"}
              </button>
              <p className="mt-3 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login here
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center mb-4">
                <FaSeedling className="text-4xl text-gray-700 mb-2" />
                <h2 className="text-xl font-bold">Your Seed</h2>
              </div>
              <label className="font-semibold text-sm mb-2">Key Seed</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {seedWords.map((word, idx) => (
                  <div
                    key={idx}
                    className="border border-blue-500 rounded-md px-2 py-1 text-sm text-center bg-white text-gray-900"
                  >
                    {word}
                  </div>
                ))}
              </div>
              <div className="flex justify-end mb-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center text-sm text-gray-700 hover:text-blue-600"
                >
                  <FaCopy className="mr-1" /> Copy
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Please write these down in case you lose your seed.
              </p>
              <button
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
              >
                Next
              </button>
              <p className="mt-3 text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Login here
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-xs text-gray-400 z-50">©Neuronus</div>
    </div>
  );
}


//DAISY SAND RUN OFFER NEST ZEST URBAN SILK DRESS WOLF COLD ECHO XENON GUM NOTE GUN