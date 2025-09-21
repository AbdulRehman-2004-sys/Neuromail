import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { EmailContext } from "../../context/EmailContext";
import { RxCross1 } from "react-icons/rx";
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
            local_part: emailData.localPart,
            domain: emailData.domainId,
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
          local_part: emailData.localPart,
          domain: emailData.domainId,
        }),
      })
      const responseData = await response.json();
      console.log("Add Email response:", responseData);
      localStorage.setItem("mailbox", JSON.stringify(responseData));
      if (response.ok) {
        navigate("/", { replace: true });
        toast.success("Mailbox created Successfully", {
          style: {
            background: "#ffffff", // white background
            color: "#000000",      // black text
          },
          icon: null, // remove default green check icon
        });
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:w-[42%] h-auto md:h-[80vh] px-6 sm:px-10 md:px-12 py-8 sm:py-16 md:py-24 text-center relative ">

        {/* Back button */}
        <button
          onClick={() => navigate("/create-mail")}
          className="absolute top-4 right-4 text-gray-500"
          aria-label="Go Back"
        >
          <RxCross1 size={20} />
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <img
            className="w-40 sm:w-48 md:w-52"
            src="https://mailing.neuromail.digital/logoName.svg"
            alt="Logo"
          />
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6">
          {status === "success"
            ? "Your address is available"
            : "Verify your email"}
        </h2>

        {status === "error" && (
          <p className="text-red-500 text-sm sm:text-base mb-3">
            This email is not available. Please try another.
          </p>
        )}

        {/* Input box */}
        <div className="relative w-full mb-5 mt-8 sm:mt-12 md:mt-16">
          <h1 className="text-sm sm:text-md text-left text-gray-600 font-semibold mb-1">
            Enter Email Address
          </h1>
          <input
            type="text"
            value={emailData.email}
            readOnly
            className="w-full border text-gray-500 bg-[#edf0f3] rounded-lg px-4 py-3 pr-10 text-sm sm:text-base"
          />

          {status === "success" && (
            <span className="absolute right-3 top-[2.4rem] sm:top-10 bg-green-800 text-white p-2 rounded-full text-xs sm:text-sm">
              <FaCheck />
            </span>
          )}
          {status === "error" && (
            <span className="absolute right-3 top-[2.4rem] sm:top-10 bg-red-500 text-white p-2 rounded-full text-xs sm:text-sm">
              <FaTimes />
            </span>
          )}
        </div>

        {/* Buttons */}
        {status === "error" ? (
          <button
            onClick={() => navigate("/create-mail")}
            className="w-full bg-blue-600 text-white font-medium py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base"
          >
            Try Again
          </button>
        ) : (
          <button
            onClick={addEmail}
            className="w-full bg-blue-600 text-white font-medium py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? "Adding..." : "Add Email"}
          </button>
        )}
      </div>
    </div>

  );
}


