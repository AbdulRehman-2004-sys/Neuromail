import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { IoAddSharp, IoCopyOutline } from "react-icons/io5";
import { PiSignOutThin } from "react-icons/pi";

export default function ProfileCard({ setShowProfile }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const emailData = JSON.parse(localStorage.getItem("emailData")) || {
    email: "user@example.com",
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(emailData.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("emailData");
    navigate("/login", { replace: true });
  };

  const handleAddEmail = () => {
    navigate("/create-mail");
  };
  return (
    <div
      className="
        absolute top-14 right-4
        w-[20rem] lg:w-[23rem]
        h-[50vh]
        bg-gray-50 rounded-2xl 
        shadow-xl p-6 flex flex-col items-center 
        z-50
      "
    >
      {/* Close Button */}
      <button
        onClick={() => setShowProfile(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      {/* Avatar */}
      <div className="w-24 h-24 flex items-center justify-center rounded-full bg-white mt-10">
        <div className="w-20 h-20 rounded-full bg-pink-500 flex items-center justify-center text-white text-3xl font-semibold relative">
          {emailData.email?.[0]?.toUpperCase() || "U"}
          {/* Small edit icon */}
          <span className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M15.232 5.232a2.5 2.5 0 113.536 3.536L7.5 20.036 3 21l.964-4.5L15.232 5.232z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Email + Copy */}
      <div className="mt-4 flex items-center gap-2 flex-wrap justify-center text-center">
        <p className="text-gray-800 break-all">{emailData.email}</p>
        <button
          onClick={handleCopy}
          className="text-gray-500 hover:text-gray-800"
        >
          <IoCopyOutline />
        </button>
      </div>
      {copied && (
        <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
      )}

      {/* Actions */}
      <div className="mt-6 flex w-full">
        <button onClick={handleAddEmail} className="flex-1 flex items-center justify-center px-3 py-3 rounded-l-full bg-white hover:bg-gray-100 text-gray-700 text-sm whitespace-nowrap gap-1.5">
          <span className="p-0.5 rounded-full bg-gray-200"><IoAddSharp className="text-blue-600" /></span> Add email address
        </button>
        <button
          onClick={handleSignOut}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-3 rounded-r-full bg-white hover:bg-gray-100 text-gray-700 text-sm"
        >
          <PiSignOutThin /> Sign out
        </button>
      </div>
    </div>
  );
}
