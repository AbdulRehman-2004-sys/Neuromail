import { useState } from "react";
import { FaEnvelope, FaExclamationTriangle, FaCopy, FaSeedling } from "react-icons/fa";
import { IoCheckmarkOutline, IoCopyOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate for redirect
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [seedWords, setSeedWords] = useState([]);
  const [loading, setLoading] = useState(false);

   const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(seedWords.join(" "));
    setCopied(true);

    // 2 seconds ke baad wapas copy icon dikhe
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };


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

      <div className={`w-full min-h-screen fixed top-0 left-0 block md:hidden bg-[rgba(0,0,255,0.5)]`}></div>

      {/* Navbar */}
      <img className="w-52 mb-4 z-50 md:block hidden" src="https://mailing.neuromail.digital/logoName.svg" alt="" />
      <div className="flex items-center space-x-2 mb-8 z-50 md:hidden">
        <img src="/icons/Layer_1.png" alt="" />
        <img className="" src="/icons/neuromail.png" alt="" />
      </div>
      {/* Card */}
      <div className="w-[88vw] h-auto md:min-h-[75vh] z-50 shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden "
      >
        {/* Left Side */}
        <div className=" bg-[length:150%] bg-left-top rounded-2xl md:bg-[url('/bg.png')] overflow-hidden mb-8 md:mb-0">
          <div className="w-full h-full bg-transparent md:bg-[rgba(0,0,255,0.6)] flex flex-col justify-center md:px-16">
            <h2 className="text-2xl text-center md:text-left md:text-3xl font-bold mb-4">
              Create Your Neuromail Account
            </h2>
            <p className="text-gray-200 -mt-4 text-center md:text-left text-xl leading-relaxed">
              Register with seed
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="p-8 px-6 flex flex-col rounded-2xl justify-center bg-[rgb(228,228,245)] text-gray-900">
          {step === 1 ? (
            <div className="px-2 md:px-8">
              <div className="flex flex-col items-center mb-4">
                <div className="flex items-center justify-center mb-8 w-24 h-24 rounded-full bg-white">
                  <FaExclamationTriangle className="text-4xl text-gray-700 mb-2" />
                </div>
                <h2 className="text-3xl font-bold">Important Note</h2>
              </div>
              <p className="text-xs font-semibold md:text-sm text-gray-700 leading-relaxed mb-6">
                On the next page you will see a series of 16 words. This is your unique and private seed and it is the ONLY way to recover your wallet in case of loss or manifestation. It is your responsibility to write it down and store it in a safe place outside of the password manager app
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
            </div>
          ) : (
            <div className="px-8">
              <div className="flex flex-col items-center mb-4">
                {/* <FaSeedling className="text-4xl text-gray-700 mb-2" /> */}
                <div className="flex items-center justify-center mb-8 w-24 h-24 rounded-full bg-white">
                  <img src="/icons/Seed.png" alt="" />
                </div>
                <h2 className="text-3xl font-bold">Your Seed</h2>
              </div>
              <label className="font-semibold text-sm mb-2">{loading ? <TbLoader3 className="animate-spin text-xl" /> : "Key Seed"}</label>

              <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 bg-white p-3 sm:p-4 rounded-md justify-center sm:justify-start">
                {seedWords.map((word, idx) => (
                  <div
                    key={idx}
                    className="inline-block w-auto border border-blue-500 rounded-md 
                 px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-900 bg-white"
                  >
                    {word}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mb-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center text-sm text-gray-700 p-2 rounded "
                >
                  {copied ? (
                    <IoCheckmarkOutline className="text-2xl" />
                  ) : (
                    <IoCopyOutline className="text-2xl" />
                  )}
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
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {/* Footer */}
      <div className="mt-6 z-50 text-xl font-bold text-white md:text-black">
        <h1 className="text-center">©Neuronus </h1>
        <h1 className="ml-2 text-center text-[rgb(184,184,244)]">v2.23.21</h1>
      </div>
    </div>
  );
}


//DAISY SAND RUN OFFER NEST ZEST URBAN SILK DRESS WOLF COLD ECHO XENON GUM NOTE GUN