import React, { useContext, useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiCornerUpRight,
  FiMoreVertical,
  FiStar,
  FiPrinter,
  FiShare
} from "react-icons/fi";
import { EmailContext } from "../../../context/EmailContext";
import ComposePopUp from "./ComposePopUp";

const EmailDetail = () => {
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

  const { emailDetail, setReplyMail, setForwardMail, setBodyShow } =
    useContext(EmailContext);

  const [showCompose, setShowCompose] = useState(false);

  const plainReply = htmlToPlainText(emailDetail?.body);

  // Patch API (mark seen, delete etc)
  const patchEmail = async (data) => {
    try {
      const emailData = JSON.parse(localStorage.getItem("emailData"));
      await fetch(
        `https://dev.api.neuromail.space/api/mailbox/${emailData.mailBoxId}/emails/${emailDetail.id}/`,
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

  useEffect(() => {
    if (emailDetail?.id) {
      patchEmail({ is_seen: true });
    }
  }, [emailDetail]);

  const handleReply = (recipients) => {
    setShowCompose(true);
    setReplyMail(recipients);
    setBodyShow({ to: true, body: false });
  };

  const handleForward = () => {
    setShowCompose(true);
    setForwardMail(emailDetail);
    setBodyShow({ to: "", body: true });
  };

  const handleDelete = () => {
    patchEmail({ deleted: true });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {showCompose && <ComposePopUp onClose={() => setShowCompose(false)} />}

      {/* Top Toolbar (Gmail-like) */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FiArrowLeft size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiTrash2 size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FiPrinter size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FiShare size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FiMoreVertical size={20} />
          </button>
        </div>

        <div className="flex items-center gap-6 text-gray-600">
          <span>1 of 50</span>
          <FiChevronLeft className="cursor-pointer hover:text-black" />
          <FiChevronRight className="cursor-pointer hover:text-black" />
        </div>
      </div>

      {/* Email Content */}
      <div className="max-w-5xl mx-auto p-6 bg-white">
        {/* Subject */}
        <h1 className="text-2xl font-semibold mb-4">
          {emailDetail?.subject || "No Subject"}
        </h1>

        {/* Sender Info */}
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase">
            {/* {emailDetail?.from?.charAt(0) || "?"} */}
            {emailDetail?.recipients[0].email || "?"}

          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {emailDetail?.recipients[0].name || "Unknown Sender"}
              </span>
              <span className="text-gray-500 text-sm">
                &lt;{emailDetail?.recipients[0].email}&gt;
              </span>
            </div>
            {/* <p className="text-sm text-gray-600">
              to {emailDetail?.recipients?.join(", ") || "me"}
            </p> */}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {formatEmailDate(emailDetail?.created_at)}
            </p>
            <button className="ml-2 text-gray-400 hover:text-yellow-500">
              <FiStar />
            </button>
          </div>
        </div>

        {/* Email Body */}
        <div className="text-gray-800 whitespace-pre-line leading-relaxed border-t pt-4">
          {plainReply || "No content available"}
        </div>

        {/* Reply / Forward Buttons */}
        <div className="flex gap-3 mt-6 border-t pt-4">
          <button
            onClick={() => handleReply(emailDetail?.recipients)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded-full hover:bg-gray-50"
          >
            Reply
          </button>
          <button
            onClick={handleForward}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded-full hover:bg-gray-50"
          >
            <FiCornerUpRight /> Forward
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;
