import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { EmailContext } from "../../context/EmailContext";
import { RxCross1 } from "react-icons/rx";

export default function CreateEmail() {
  const { emailData, setEmailData } = useContext(EmailContext);
  const [localPart, setLocalPart] = useState("");
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  console.log(selectedDomain)
  console.log(typeof (selectedDomain))
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();

  console.log(location.state); // debug ke liye

  // 🚫 Prevent back navigation
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      // Stay on this page OR push them to /verify-email if you want
      navigate("/create-email", { replace: true });
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  // Fetch domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await fetch(
          "https://dev.api.neuromail.space/api/mailbox/extensions/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch domains.");
        const data = await res.json();

        const domainList = data.results || [];
        setDomains(domainList);

        if (domainList.length > 0) setSelectedDomain(domainList[0].id.toString());
      } catch (err) {
        console.error("Failed to fetch domains:", err);
        toast.error(err.message || "Failed to load domains.");
      }
    };

    fetchDomains();
  }, []);

  const handleCreateEmail = async () => {
    if (!localPart.trim()) {
      toast.error("Please enter a name for your email.");
      return;
    }
    if (!selectedDomain) {
      toast.error("Please select a domain.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("You must log in first.");
        return;
      }

      const res = await fetch("https://dev.api.neuromail.space/api/mailbox/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      const data = await res.json().catch(() => ({}));
      console.log(data)

      if (!res.ok) {
        const errMsg =
          data?.error?.[0] ||
          data?.email?.[0] ||
          data?.domain?.[0] ||
          data?.detail ||
          data?.message ||
          "Failed to create email.";
        toast.error(errMsg);
        return;
      }

      const selectedDomainName =
        domains.find((d) => d.id.toString() === selectedDomain)?.name ||
        "neuromail.cloud";
      const createdEmail =
        data.email || `${localPart}@${selectedDomainName}`;

      setEmailData({
        email: createdEmail,
        localPart: localPart.trim(),
        domainId: selectedDomain,
      });

      const emailData = {
        mailBoxId: data.id,
        email: createdEmail,
        localPart: localPart.trim(),
        domainId: selectedDomain,
      }
      // save to localStorage
      localStorage.setItem("emailData", JSON.stringify(emailData));

      navigate("/verify-email", { replace: true });
    } catch (err) {
      console.error("Create email failed:", err);
      toast.error(err.message || "Email creation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-50 px-4 md:px-0">
      <div className="w-full md:w-[60vw] h-auto md:h-[85vh] flex items-center justify-center py-8 md:py-0">
        <div className="bg-white relative w-full h-full rounded-md px-6 sm:px-12 md:px-16 py-8 sm:py-16 md:py-24">

          {/* Close button */}
          <button
            onClick={() => navigate("/create-mail")}
            className="absolute top-4 right-4 text-gray-500"
            aria-label="Go Back"
          >
            <RxCross1 size={20} />
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6 md:mb-6">
            <img className="w-40 sm:w-48 md:w-52" src="https://mailing.neuromail.digital/logoName.svg" alt="Logo" />
          </div>

          {/* Title */}
          <h2 className="text-center text-lg sm:text-xl md:text-2xl font-bold mb-8 sm:mb-12 md:mb-16 px-2">
            Create your first email address for free
          </h2>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3">

              {/* Name input */}
              <div className="w-full md:w-[60%]">
                <h1 className="text-md text-gray-600 font-semibold mb-1">Enter Name</h1>
                <input
                  type="text"
                  placeholder="Name here"
                  value={localPart}
                  onChange={(e) => setLocalPart(e.target.value)}
                  className="w-full bg-[#edf0f3] rounded-lg px-4 py-3 outline-none text-sm sm:text-base"
                />
              </div>

              {/* Domain select */}
              <div className="w-full md:w-[40%]">
                <h1 className="text-md text-gray-600 font-semibold mb-1">Choose extension</h1>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full bg-[#edf0f3] rounded-lg px-4 py-3 outline-none text-sm sm:text-base"
                >
                  <option value="" disabled>
                    Select a domain
                  </option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Submit button */}
            <div className="w-full sm:w-[80%] md:w-[62%] mx-auto mt-4">
              <button
                onClick={handleCreateEmail}
                disabled={loading || !selectedDomain}
                className="w-full bg-blue-400 text-white font-medium py-2 rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Next"}
              </button>

              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                Note: This email is free, your next email address will cost 10 USD per domain, charged from your primary wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}


//TRUCK VACCINE NORTH TRUCK ELK NICE SILK ALERT URBAN WISH ICE VOLCANO ICE UNDER USE WALL