import { useContext, useState } from "react";
import {
  FaTimes,
  FaTrash,
  FaPaperclip,
  FaImage,
  FaGlobe,
  FaSmile,
} from "react-icons/fa";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "react-toastify";
import { EmailContext } from "../../../context/EmailContext";

export default function ComposePopUp({ onClose }) {
  const [toList, setToList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const { replyMail, forwardMail, bodyShow } = useContext(EmailContext);
  const singleMail = replyMail.filter((mail) => mail.recipient_type === "from");
  const token = localStorage.getItem("accessToken");
  const emailData = JSON.parse(localStorage.getItem("emailData"));

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      setToList([...toList, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeEmail = (index) => {
    setToList(toList.filter((_, i) => i !== index));
  };

  const sendEmail = async () => {
    try {
      const plainTextBody = content.replace(/<[^>]+>/g, "").trim();
      const recipients = toList.map((email) => ({
        email,
        name: email.split("@")[0],
        recipient_type: "to",
      }));

      if (cc) {
        recipients.push({
          email: cc,
          name: cc.split("@")[0],
          recipient_type: "cc",
        });
      }
      if (bcc) {
        recipients.push({
          email: bcc,
          name: bcc.split("@")[0],
          recipient_type: "bcc",
        });
      }

      const res = await fetch(
        `https://dev.api.neuromail.space/api/mailbox/${emailData.mailBoxId}/emails/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            recipients,
            subject,
            body: plainTextBody,
            email_type: "sent",
            attachments: [],
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Email sent successfully!");
        onClose();
      } else {
        toast.error("Failed: " + JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const handleDelete = () => {
    onClose();
  };

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 w-full max-w-[95%] sm:max-w-[550px] bg-white shadow-2xl border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b bg-gray-50">
        <div>
          <h3 className="text-sm font-medium">New Message</h3>
          <p className="text-xs text-gray-500">
            From &lt;{emailData.email}&gt;
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-black text-lg"
          aria-label="Close"
        >
          <FaTimes />
        </button>
      </div>

      {/* To / Cc / Bcc / Subject */}
      <div className="flex flex-col px-3 sm:px-4 py-2 gap-2">
        {/* To */}
        <div className="flex flex-wrap sm:flex-nowrap items-start gap-2">
          <h2 className="text-sm mt-2">To</h2>
          <div className="flex flex-wrap gap-2 border-b border-gray-200 flex-1 pb-1">
            {toList.map((email, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  {email[0].toUpperCase()}
                </div>
                <span>{email}</span>
                <button
                  onClick={() => removeEmail(index)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
            <input
              type="text"
              value={inputValue || (bodyShow.to && singleMail[0]?.email)}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 text-sm focus:outline-none min-w-[120px]"
            />
          </div>
          <button
            onClick={() => setShowCc(!showCc)}
            className="text-xs text-blue-600 hover:underline mt-2"
          >
            Cc
          </button>
          <button
            onClick={() => setShowBcc(!showBcc)}
            className="text-xs text-blue-600 hover:underline mt-2"
          >
            Bcc
          </button>
        </div>

        {/* CC */}
        {showCc && (
          <div className="flex gap-1 items-center w-full">
            <h2 className="text-sm">Cc</h2>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="w-full border-b border-gray-200 pb-1 text-sm focus:outline-none"
            />
          </div>
        )}

        {/* BCC */}
        {showBcc && (
          <div className="flex gap-1 items-center w-full">
            <h2 className="text-sm">Bcc</h2>
            <input
              type="text"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              className="w-full border-b border-gray-200 pb-1 text-sm focus:outline-none"
            />
          </div>
        )}

        {/* Subject */}
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border-b border-gray-200 pb-1 text-sm focus:outline-none"
        />
      </div>

      {/* Editor */}
      <div className="px-3 sm:px-4 py-2">
        <ReactQuill
          value={content || (bodyShow.body && forwardMail?.body)}
          onChange={setContent}
          theme="snow"
          placeholder="Write your message..."
          className="h-40 sm:h-48"
        />
      </div>

      {/* Footer */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between mt-4 sm:mt-9 px-3 sm:px-4 py-2 border-t bg-gray-50">
        {/* Left: Send Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={sendEmail}
            className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium"
          >
            Send
          </button>
          <img src="icons/Vector.png" alt="" />
          <img src="icons/Vector (5).png" alt="" />
          <img src="icons/Vector (4).png" alt="" />
          <img src="icons/Vector (3).png" alt="" />
          <img src="icons/Vector (6).png" alt="" />
          <img src="icons/Vector (1).png" alt="" />
        </div>

        {/* Right: Delete */}
        <div className="relative group mt-2 sm:mt-0">
          <button
            onClick={handleDelete}
            className="text-gray-500 text-lg cursor-pointer"
            aria-label="Delete"
          >
            <FaTrash />
          </button>
          <span className="absolute bottom-8 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Delete
          </span>
        </div>
      </div>
    </div>
  );
}
