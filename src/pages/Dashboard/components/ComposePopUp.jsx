import { useContext, useEffect, useState } from "react";
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
import { FiChevronDown } from "react-icons/fi";
import { MdOutlineAttachFile, MdOutlineImage } from "react-icons/md";
import { IoMdArrowDropdown } from "react-icons/io";

export default function ComposePopUp({ onClose }) {
  const [toList, setToList] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  // Add at top inside ComposePopUp
  const [attachments, setAttachments] = useState([]);

  const { replyMail, forwardMail, bodyShow } = useContext(EmailContext);
  console.log(replyMail);
  // const singleMail = replyMail.filter((mail) => mail.recipient_type === "from");
  // console.log(singleMail);

  const token = localStorage.getItem("accessToken");
  const emailData = JSON.parse(localStorage.getItem("emailData"));
  const mailbox = JSON.parse(localStorage.getItem("mailbox"));
  console.log(emailData)

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setAttachments((prev) => [...prev, file]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddEmail = () => {
    if (inputValue.trim()) {
      setToList([...toList, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleBlur = () => {
    handleAddEmail();
  };
  // 👇 inside your component
  useEffect(() => {
    if (bodyShow?.to && replyMail?.email && toList.length === 0) {
      setToList([replyMail.email]);   // ✅ array ban gaya
    }
  }, [replyMail, bodyShow, toList.length]);

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
      // ✅ create FormData
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("email_type", "sent");
      formData.append("recipients", JSON.stringify(recipients));

      // 🔑 Always provide a body
      const htmlBody = content?.trim()
        ? content  // actual user content
        : "<p>&nbsp;</p>"; // or "<p>No message</p>" — a blank HTML body
      formData.append("body", htmlBody);

      // Add every file
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });
      console.log(formData)

      const res = await fetch(
        `https://dev.api.neuromail.space/api/mailbox/${mailbox.id}/emails/`,
        {
          method: "POST",
          headers: {
            // "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Message sent successfully!");
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
  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],        // B I U S
      [{ list: "ordered" }, { list: "bullet" }],        // Numbered / Bullets
      [{ align: [] }],                                  // Align
      ["blockquote", "code-block"],                     // Quote / Code
      ["link"],                                         // Link
      ["clean"],                                        // Remove formatting
    ],
  };
  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 w-full max-w-[95%] sm:max-w-[550px] bg-white shadow-2xl border rounded-lg overflow-hidden text-black z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b bg-gray-50">
        <div>
          <h3 className="text-sm font-medium">New Message</h3>
          <p className="text-xs text-gray-500">
            From {emailData.localPart} &lt;{emailData.email}&gt;
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}   // ✅ works for reply auto-fill
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
      {/* Editor */}
      <div className="px-3 sm:px-4 py-2">
        {/* 🔑 Fixed scrollable area */}
        <div className="custom-editor-wrapper h-[40vh] overflow-y-auto border border-gray-300 rounded">
          <ReactQuill
            value={content || (bodyShow.body && forwardMail?.body)}
            onChange={setContent}
            theme="snow"
            modules={modules}
            className="custom-quill"  // body border removed by CSS
          />

          {/* Attachments inside same scroll box */}
          {attachments.length > 0 && (
            <div className="px-3 sm:px-4 py-2 border-t bg-gray-50">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 px-3 py-2 mb-2 rounded"
                >
                  <div className="text-sm">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-gray-500 cursor-pointer hover:text-red-600"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Footer */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between mt-4 sm:mt-9 px-3 sm:px-4 py-2 border-t bg-gray-50">
        {/* Left: Send Button */}
        <div className="flex items-center justify-between">
          <div className="border-2 border-blue-600 rounded-full mr-3 h-10 w-[6.8rem] flex items-center justify-center">
            <button
              onClick={sendEmail}
              className="flex items-center bg-blue-600 text-white px-4 h-8 rounded-full text-sm font-medium z-50"
            >
              <span>Send</span>
              <span className="ml-4 h-[70%] flex items-center justify-center border-l border-gray-400">
                <IoMdArrowDropdown className="text-white text-xs ml-2" />
              </span>
            </button>
          </div>


          <div className="flex items-center gap-3">
            <div className="relative group mt-2 sm:mt-0">
              <label className="cursor-pointer">
                <MdOutlineAttachFile className="text-gray-600 opacity-100" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
              <span className="absolute bottom-8 -right-8 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                Attachments
              </span>
            </div>

            <MdOutlineImage className="text-gray-600" />
            <div className="relative group mt-2 sm:mt-0">
              <img src="icons/Vector (6).png" alt="" />
              <span className="absolute bottom-8 -right-8 bg-black text-white text-xs px-2 py-1 rounded opacity-0 whitespace-nowrap group-hover:opacity-100 transition">
                Writing Styles
              </span>
            </div>
            <img src="icons/Logo (1).png" alt="" />
          </div>
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
