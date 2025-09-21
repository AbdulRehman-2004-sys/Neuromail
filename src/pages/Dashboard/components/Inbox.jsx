// Inbox.jsx
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { toast } from "react-toastify";
import { EmailContext } from "../../../context/EmailContext";
import { useNavigate } from "react-router-dom";
import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";

const Inbox = forwardRef((props, ref) => {
  const navigate = useNavigate();

  const mailbox = JSON.parse(localStorage.getItem("mailbox"));

  const { setCountRead } = props;
  const { filter } = props;
  const { selectAll } = props;
  const { search } = props;
  const { selectedIds } = props;
  const { toggleSingle } = props;

  const [bookMark, setBookMark] = useState(false);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmails = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `https://dev.api.neuromail.space/api/mailbox/${mailbox.id}/emails/?email_type=inbox&is_seen=&is_starred=&search=&page=1`,
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
      localStorage.setItem("allMails", JSON.stringify(data.results))
      setCountRead(data.results.filter(email => !email.is_seen).length);
    } catch (error) {
      console.error("Error fetching emails:", error);
      setError(error.message);
      toast.error("Failed to load emails");
    } finally {
      setLoading(false);
    }
  };


  const patchEmail = async (data, id) => {
    try {
      const mailbox = JSON.parse(localStorage.getItem("mailbox"));
      await fetch(
        `https://dev.api.neuromail.space/api/mailbox/${mailbox.id}/emails/${id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 👇 Expose the function to parent
  useImperativeHandle(ref, () => ({
    fetchEmails
  }));

  
  useEffect(() => {
    fetchEmails();
  }, []);
  // setLoadMail(fetchEmails)
  const handleId = (email) => {
    // setEmailDetail(email)
    localStorage.setItem("emailDetail", JSON.stringify(email))
    navigate("/email-data")
  }

  const handleBookMark = (id, value) => {
    setBookMark((prev) => ({
      ...prev,
      [id]: value,   // ✅ directly true/false set kare
    }));
  };
  // 🔑 Update all when parent changes
  useEffect(() => {
    setEmails((prev) =>
      prev.map((e) => ({ ...e, selected: selectAll }))
    );
  }, [selectAll]);


  // ✅ Apply filter
  const filteredEmails = emails.filter((email) => {
    if (filter === "all") return true;
    if (filter === "read") return email.is_seen === true;
    if (filter === "unread") return email.is_seen === false;
    if (filter === "file") return email.attachments?.length > 0;
    return true;
  });

  // decide which list to render
  const displayEmails =
    Array.isArray(search) && search.length > 0 ? search : filteredEmails;



  if (loading) return <p className="text-gray-500">Loading emails...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (emails.length === 0 || filteredEmails.length === 0)
    return <p className="text-gray-500">No emails found.</p>;

  return (
    <div className="px-1 py-2 space-y-1 pt-8 w-full min-h-screen text-black text-sm font-bold ">
      {displayEmails.map((email, i) => (

        <div
          onClick={() => handleId(email)}
          key={i}
          className={`flex items-center justify-between ${email.is_seen === true ? "bg-[#f1f5fa]" : "bg-white"} w-full md:w-[96%] md:mx-auto rounded-xl shadow px-4 py-4 cursor-pointer `}
        >
          <div className="flex items-center gap-8 w-[10vw]">
            <div className="flex gap-2 items-center text-gray-600 text-sm ">

              <div onClick={(e) => e.stopPropagation()} // ✅ wrapper stops parent
                className="inline-block z-50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(email.id)}
                  onChange={() => toggleSingle(email.id)}
                  className="appearance-none w-5 h-5 rounded border-2 border-gray-300 checked:bg-blue-600 focus:outline-none cursor-pointer"
                />
              </div>
              <button
                className="z-50"
                onClick={(e) => {
                  e.stopPropagation(); // parent div ka click stop kare

                  if (bookMark[email.id]) {
                    // 🔵 Blue star → unstar karo
                    patchEmail({ is_starred: false }, email.id);   // ✅ backend update
                    handleBookMark(email.id, false);     // ✅ state update
                  } else {
                    // ⚪ Gray star → star karo
                    patchEmail({ is_starred: true }, email.id);    // ✅ backend update
                    handleBookMark(email.id, true);      // ✅ state update
                  }
                }}
              >
                {bookMark[email.id] ? (
                  <FaStar className="text-blue-600 text-lg" />
                ) : (
                  <FaStar className="text-gray-300 text-lg" />
                )}
              </button>
            </div>
            {email.recipients.map((rec, index) => {
              if (rec.recipient_type === "from")
                return (
                  <h1 key={index} className="hidden md:block whitespace-nowrap">
                    {rec.name || "unkown"}
                  </h1>
                )
            })

            }
          </div>
          <div className="flex items-center gap-12 md:w-[30vw]">
            <span className="text-blue-600 bg-[rgba(0,0,255,0.2)] text-[0.7rem] px-2 rounded-lg">Inbox</span>
            <div className="truncate w-[10vw]">
              {email.body.replace(/<[^>]+>/g, "")}...
            </div>
          </div>
          <h1>
            {new Date(email.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </h1>
        </div>
      ))}

    </div>
  );
});

export default Inbox;


// NORTH ZIP COW LUNCH WAVE ITEM EAGLE MOON HAMBURGER YAK CUP XENOPHOBIA ZINC ZEBRA KIDNEY EDGE