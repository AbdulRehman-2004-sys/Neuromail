// Inbox.jsx
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { EmailContext } from "../../../context/EmailContext";
import { useNavigate } from "react-router-dom";

const Inbox = () => {

  const navigate = useNavigate();
  const { setEmailDetail } = useContext(EmailContext)

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMailbox = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        "https://dev.api.neuromail.space/api/mailbox/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to fetch emails");
      }

      const data = await res.json();
      console.log(data)

    } catch (error) {
      console.error("Error fetching emails:", error);
    }
  }

  useEffect(() => {
    fetchMailbox()
  }, [])
  const emailData = JSON.parse(localStorage.getItem("emailData"));
  console.log(emailData)

  const fetchEmails = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `https://dev.api.neuromail.space/api/mailbox/121qiq2qbqg7fnp/emails/?email_type=sent&is_seen=&is_starred=&search=&page=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log(data)
      setEmails(data.results || []); // depends on API shape
    } catch (error) {
      console.error("Error fetching emails:", error);
      setError(error.message);
      toast.error("Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleId = (email) => {
    setEmailDetail(email)
    navigate("/email-data")
  }
  if (loading) return <p className="text-gray-500">Loading emails...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (emails.length === 0)
    return <p className="text-gray-500">No emails found.</p>;

  return (
    <div className="p-4 space-y-4 w-full min-h-screen text-black text-sm font-bold">
      {emails.map((email, i) => (

        <div
          onClick={() => handleId(email)}
          key={i}
          className="flex items-center justify-between bg-white w-[96%] mx-auto rounded-xl mb-3 shadow px-4 py-2 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-8">
            <div className="flex gap-2 text-gray-600 text-sm ">
              <input type="checkbox" />
              <h1>*</h1>
            </div>
            <h1>{email.recipients[0].name}</h1>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <span className="text-blue-600 bg-[rgba(0,0,255,0.2)] text-[0.7rem] px-2 rounded-lg">Inbox</span>
              <div className="truncate w-full">
                {email.body}
              </div>
            </div>
          </div>
          <h1>{email.created_at}</h1>
        </div>
      ))}
    </div>
  );
};

export default Inbox;


// LADDER ZERO JOURNAL TENT JEEP NAME ZEN VINE HANDS ROSE ROSE DUST PENCIL QUOTE WATER ART