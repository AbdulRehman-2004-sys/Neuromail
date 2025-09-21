import React, { useContext, useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiCornerUpRight,
  FiMoreVertical,
  FiStar,
  FiPrinter,
  FiShare,
  FiDownload,
  FiMail,
  FiCode
} from "react-icons/fi";
import { EmailContext } from "../../../context/EmailContext";
import ComposePopUp from "./ComposePopUp";
import { GoReply } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import { LuTrash2 } from "react-icons/lu";
import { IoIosArrowRoundBack } from "react-icons/io";
import { BsEnvelopeArrowDown, BsThreeDotsVertical } from "react-icons/bs";
import { CiMenuKebab } from "react-icons/ci";
import { toast } from "react-toastify";
import DashboardLayout from "./DashboardLayout";

const EmailDetail = () => {

  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate()
  // Close when click outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function formatEmailDate(isoDate) {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function htmlToPlainText(html) {
    if (!html) return "";
    let text = html
      .replace(/<\/div>|<\/p>|<br\s*\/?>/gi, "\n")
      .replace(/<\/li>/gi, "\n- ")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<\/blockquote>/gi, "\n")
      .replace(/<[^>]+>/g, "");
    text = text.replace(/\n\s*\n\s*\n+/g, "\n\n");
    text = text.replace(/&nbsp;/gi, " ");
    text = text.replace(/&amp;/gi, "&");
    text = text.replace(/&lt;/gi, "<");
    text = text.replace(/&gt;/gi, ">");
    return text.trim();
  }

  const emailDetail = JSON.parse(localStorage.getItem("emailDetail"))

  const { setReplyMail, setForwardMail, setBodyShow } =
    useContext(EmailContext);
  console.log(emailDetail)
  const [showCompose, setShowCompose] = useState(false);

  const plainReply = htmlToPlainText(emailDetail?.body);

  // Patch API (mark seen, delete etc)
  const patchEmail = async (data) => {
    try {
      const mailbox = JSON.parse(localStorage.getItem("mailbox"));
      const res = await fetch(
        `https://dev.api.neuromail.space/api/mailbox/${mailbox.id}/emails/${emailDetail.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        }

      );
      const resData = await res.json();
      if (resData.is_seen === false) {
        navigate("/inbox");
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };


  //delete
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      const mailbox = JSON.parse(localStorage.getItem("mailbox"));
      const res = await fetch(
        `https://dev.api.neuromail.space/api/mailbox/${mailbox.id}/emails/move-to-trash/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ emails: [id] }),
        }
      );

      const data = await res.json();
      console.log(data)
      if (data) {
        toast.success(data.message || "Email moved to trash");
        navigate("/inbox");
      }

    } catch (error) {
      console.error("Failed to delete Email:", error);
      toast.error("Failed to delete Email");
    }
  };

  useEffect(() => {
    if (emailDetail?.id) {
      patchEmail({ is_seen: true });
    }
  }, [emailDetail]);

  const handleReply = (recipients) => {
    console.log(recipients);
    setShowCompose(true);
    setReplyMail(recipients);
    setBodyShow({ to: true, body: false });
  };

  const handleForward = () => {
    setShowCompose(true);
    setForwardMail(emailDetail);
    setBodyShow({ to: "", body: true });
  };


  return (
    <DashboardLayout>
      <div className="w-full min-h-screen pt-8 bg-[#f6f8fc] text-black">
        {showCompose && <ComposePopUp onClose={() => setShowCompose(false)} />}

        {/* Top Toolbar (Gmail-like) */}
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2 border-b bg-[#f6f8fc] sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="relative group">
              {/* Icon with hover bg */}
              <div className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
                <IoIosArrowRoundBack onClick={() => navigate(-1)} className="text-2xl" />
              </div>

              {/* Tooltip */}
              <span className="absolute left-1/2 -translate-x-1/2 -top-7 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Back
              </span>
            </div>

            <div className="relative group">
              {/* Icon with hover bg */}
              <div className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
                <BsEnvelopeArrowDown onClick={() => patchEmail({ is_seen: false })} className="text-xl" />
              </div>

              {/* Tooltip */}
              <span className="absolute left-1/2 -translate-x-1/2 -top-7 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 whitespace-nowrap group-hover:opacity-100 transition-opacity">
                Mark as unread
              </span>
            </div>
            <div className="relative group">
              {/* Icon with hover bg */}
              <div className="p-2 rounded-full hover:bg-gray-200 cursor-pointer">
                <LuTrash2 onClick={() => handleDelete(emailDetail.id)} className="text-xl" />
              </div>

              {/* Tooltip */}
              <span className="absolute left-1/2 -translate-x-1/2 -top-7 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Delete
              </span>
            </div>

          </div>

          <div className="flex items-center gap-6 text-gray-600">
            <span className="text-2xl text-black">1 of 50</span>
            <FiChevronLeft className="text-2xl cursor-pointer hover:text-black" />
            <FiChevronRight className="text-2xl cursor-pointer hover:text-black" />
          </div>
        </div>

        {/* Email Content */}
        <div className="max-w-5xl mx-auto p-6 bg-[#f6f8fc]">
          {/* Subject */}
          <h1 className="text-2xl font-semibold mb-4">
            {emailDetail?.subject || "No Subject"}
          </h1>

          {/* Sender Info */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase">
              {/* {emailDetail?.from?.charAt(0) || "?"} */}
              {emailDetail?.recipients[0].email[0] || "?"}

            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {emailDetail.recipients.map((rec, index) => {
                    if (rec.recipient_type === "from")
                      return (
                        <>
                          <h1 key={index} className="hidden text-2xl md:block whitespace-nowrap">
                            Neuromail
                          </h1>
                          <span className="text-black text-sm font-light">
                            From {rec.name}&lt;{emailDetail?.recipients[0].email}&gt;
                          </span>
                        </>
                      )
                  })

                  }
                </span>

              </div>
              {/* <p className="text-sm text-gray-600">
              to {emailDetail?.recipients?.join(", ") || "me"}
            </p> */}
            </div>
            <div className="text-right flex items-center gap-2 mr-10">
              <p className="text-sm text-gray-500">
                {new Date(emailDetail?.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <div className="relative" ref={menuRef}>
                {/* Icon Button */}
                <div
                  onClick={() => setOpen(!open)}
                  className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
                >
                  <BsThreeDotsVertical className="text-lg" />
                </div>

                {/* Dropdown Menu */}
                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl border border-gray-200 py-2 text-sm z-50">
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                      <FiPrinter /> Print
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                      <FiCode /> Show original
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                      <FiMail /> Mark as unread
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                      <FiDownload /> Download message
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-red-600">
                      <FiTrash2 /> Delete this message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="whitespace-pre-line text-sm text-gray-800">
            {plainReply || "No content available"}
          </div>

          {/* Reply / Forward Buttons */}
          <div className="flex gap-3 mt-6 border-t pt-4">
            <button
              onClick={() =>
                handleReply(
                  emailDetail.recipients.find(rcep => rcep.recipient_type === "from")
                )
              }
              className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:shadow-lg w-56"
            >
              <div className="flex items-center gap-2">
                <GoReply /> Reply
              </div>
            </button>
            <button
              onClick={handleForward}
              className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:shadow-lg w-56"
            >
              <div className="flex items-center gap-2">
                <FiCornerUpRight /> Forward
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmailDetail;
