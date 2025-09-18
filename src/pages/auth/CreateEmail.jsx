import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { EmailContext } from "../../context/EmailContext";

export default function CreateEmail() {
  const { emailData, setEmailData } = useContext(EmailContext);
  const [localPart, setLocalPart] = useState("");
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  console.log(selectedDomain)
  console.log(typeof (selectedDomain))
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          local_part: localPart.trim(),
          domain: selectedDomain,
        }),
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
        mailBoxId:data.id,
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
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gray-50">
      <div className="w-full md:w-[80vw] flex items-center justify-center p-6">
        <div className="bg-white shadow-md rounded-xl p-10 w-full max-w-lg">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img className="w-52" src="https://mailing.neuromail.digital/logoName.svg" alt="" />
          </div>

          {/* Title */}
          <h2 className="text-center text-xl md:text-2xl font-semibold mb-8">
            Create your first email address for free
          </h2>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Name here"
                value={localPart}
                onChange={(e) => setLocalPart(e.target.value)}
                className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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

            <button
              onClick={handleCreateEmail}
              disabled={loading || !selectedDomain}
              className="w-full bg-blue-400 text-white font-medium py-2 rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Next"}
            </button>

            <p className="text-gray-500 text-sm text-center mt-2">
              Note: This email is free, your next email address will cost 10 USD
              per domain, charged from your primary wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


//SALAD KING CUP CAR GRAPE HILL NOSE BAND MOUSE SCHOOL PEN POTATO QUALITY BITE OCTOPUS WALL