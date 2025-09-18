import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { EmailContext } from "../../context/EmailContext";
//amckgoturndsmxsiwfbvfiurb3984
export default function VerifyEmail() {
  const navigate = useNavigate();
  // const { emailData } = useContext(EmailContext);
  // console.log(emailData)
  // console.log(emailData.localPart, emailData.domainId, emailData.email)
  // Email for display and the data needed for the API
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [loading, setLoading] = useState(false);

  const emailData = JSON.parse(localStorage.getItem("emailData"));
  console.log(emailData)
  const token = localStorage.getItem("accessToken");

  // Validate on mount
  useEffect(() => {
    if (emailData) {
      validateEmail();
    }
  }, []); // 👈 empty dependency

  const validateEmail = async () => {

    try {
      setLoading(true);

      const res = await fetch(
        "https://dev.api.neuromail.space/api/mailbox/existance/verify/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            local_part: "rockdanis50022004",
            domain: "123abcdefijklm4",
          }),
        },

        // console.log(local_part,domain)
      );
      console.log(res)
      const data = await res.json();
      console.log("Verify response:", data);
      if (res.ok) {

        setStatus("success");
      }
    } catch (err) {
      console.error("Email verification failed:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };


  const addEmail = async () => {
    try {
      const response = await fetch("https://dev.api.neuromail.space/api/mailbox/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          local_part: "rockdanis50022004",
          domain: "123abcdefijklm4",
        }),
      })
      console.log(response)

      if (response.ok) {
        navigate("/", { replace: true });
        toast.success("Mailbox Created Successfully.")
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 p-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/create-mail")}
        className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        aria-label="Go Back"
      >
        <FaTimes size={22} />
      </button>

      <div className="bg-white shadow-md rounded-2xl p-10 w-full max-w-lg text-center">
        <div className="flex justify-center mb-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mail_%28iOS%29.svg/1024px-Mail_%28iOS%29.svg.png"
            alt="Neuromail Logo"
            className="w-12 h-12"
          />
        </div>

        <h2 className="text-xl md:text-2xl font-semibold mb-6">
          {status === "success" ? "Your address is verified" : "Verify your email"}
        </h2>

        {status === "error" && (
          <p className="text-red-500 text-sm mb-3">
            This email is not available. Please try another.
          </p>
        )}

        <div className="relative w-full mb-5 mt-16">
          <h1 className="text-left">Enter Email Address</h1>
          <input
            type="text"
            value={emailData.email}
            readOnly
            className={`w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none ${status === "error"
              ? "border-red-400"
              : status === "success"
                ? "border-green-400"
                : "border-gray-300"
              }`}
          />
          {status === "success" && (
            <span className="absolute right-3 top-8 bg-green-500 text-white p-1 rounded-full text-sm">
              <FaCheck />
            </span>
          )}
          {status === "error" && (
            <span className="absolute right-3 top-2.5 bg-red-500 text-white p-1 rounded-full text-sm">
              <FaTimes />
            </span>
          )}
        </div>

        <button
          onClick={addEmail}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          Add Email
        </button>
      </div>
    </div>
  );
}


// {"id":"121zgeivwrJ4RhW","email":"abdul6002@neuromail.cloud"}
// {"id":"121qiq2qbqg7fnp","email":"rockdanis5002@neuromail.cloud"}

