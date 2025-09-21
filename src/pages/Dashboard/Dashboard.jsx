import {
  FaRegFileAlt,
  FaPaperPlane,
  FaStar,
  FaExclamationTriangle,
  FaTrash
} from "react-icons/fa";
import ComposePopUp from "./components/ComposePopUp";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import ProfileCard from "./components/ProfileCard";
import Inbox from "./components/Inbox";
import { LuTrash2 } from "react-icons/lu";
import { toast } from "react-toastify";

export default function Dashboard() {
  const childRef = useRef(null);
  const navigate = useNavigate();

  const mailbox = JSON.parse(localStorage.getItem("mailbox"));
  const emailData = JSON.parse(localStorage.getItem("emailData")) || {
    email: "user@example.com",
    localPart: "User",
  };
  const allMails = JSON.parse(localStorage.getItem("allMails"))
  // const allMails = [{email:"data"}]
  const token = localStorage.getItem("accessToken");


  const [showCompose, setShowCompose] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [countRead, setCountRead] = useState();
  const [filter, setFilter] = useState("all"); // all, read, unread, file
  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState(false)
  console.log(checked)


  const [selectedIds, setSelectedIds] = useState([]);       // ✅ selected child IDs
  console.log(selectedIds)
  // const allSelected = selectedIds.length === allMails.length; // ✅ derived
  const allSelected = allMails.length > 0 && selectedIds.length === allMails.length;
  const anySelected = selectedIds.length > 0; // 🔑 check if at least one is selected
  console.log(allSelected)

  // ✅ Toggle ALL from parent
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]); // unselect all
    } else {
      setSelectedIds(allMails.map((e) => e.id)); // select all
    }
  };

  // ✅ Toggle single child
  const toggleSingle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleNaviagte = () => {
    navigate("/inbox");
  };

  // For search functionality
  const clickfetchInboxEmails = async () => {
    try {
      const url = `https://dev.api.neuromail.space/api/mailbox/${mailbox.id}/emails/?email_type=inbox&is_seen=&is_starred=&search=&page=1`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      console.log(data)
      // setEmails(data.results || []); // ✅ update state
    } catch (err) {
      console.error("Error fetching emails:", err);
    }
  };
  // 🔹 Function to call the API
  const fetchInboxEmails = async (searchValue) => {
    try {
      const url = `https://dev.api.neuromail.space/api/mailbox/${mailbox.id}/emails/?email_type=inbox&is_seen=&is_starred=&search=${encodeURIComponent(searchValue)}&page=1`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      setEmails(data.results || []); // ✅ update state
    } catch (err) {
      console.error("Error fetching emails:", err);
    }
  };

  // 🔹 Input change handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchInboxEmails(value); // ✅ call API as user types
  };

  //delete
  const handleDelete = async () => {
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
          body: JSON.stringify({ emails: selectedIds }),
        }
      );

      const data = await res.json();
      console.log(data)
      if (data && childRef?.current) {
        setSelectedIds([]);
        childRef.current.fetchEmails();
        toast.success(data.message || "Email moved to trash");
      }

    } catch (error) {
      console.error("Failed to delete Email:", error);
      toast.error("Failed to delete Email");
    }
  };


  return (
    <div className="min-h-screen flex bg-[#f6f8fc]">
      {showProfile && <ProfileCard setShowProfile={setShowProfile} />}

      {/* Overlay for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-[17rem] bg-[#f1f5fa] shadow-md flex flex-col justify-between transform transition-transform duration-300 z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div>
          {/* New Message */}
          <div className="px-4 py-3 flex justify-end items-center flex-col gap-2">
            {/* Logo */}
            <img
              className="w-36"
              src="https://mailing.neuromail.digital/logoName.svg"
              alt="logo"
            />

            <button
              onClick={() => setShowCompose(true)}
              className="w-full flex items-center justify-center gap-2 text-white py-2 rounded-lg font-sm font-bold bg-blue-600 hover:shadow-md transition"
            >
              New Message
            </button>
          </div>

          {/* Menu */}
          <nav className="flex flex-col px-4 text-gray-700">
            <button
              
              className="flex items-center justify-between bg-white text-black font-medium gap-3 px-3 py-2 rounded-lg transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg text-blue-600">
                  <img src="/icons/direct-inbox.png" alt="" />
                </span>
                Inbox
              </div>

              <div className="flex items-center gap-2">
                <img onClick={() => {
                  // 👇 Call child function from parent
                  if (childRef.current) {
                    childRef.current.fetchEmails();
                  }
                }} src="/icons/refresh-right-square.png" alt="" />
                {countRead > 0 && <div className="text-white text-xs bg-blue-600 px-1 py-1 rounded-md">{countRead}</div>}
              </div>
            </button>

            <SidebarItem icon={<FaRegFileAlt />} text="Drafts" />
            <SidebarItem icon={<FaPaperPlane />} text="Sent" />
            <SidebarItem icon={<FaStar />} text="Starred" />
            <SidebarItem icon={<FaExclamationTriangle />} text="Spam" />
            <SidebarItem icon={<FaTrash />} text="Delete" />
          </nav>

          {/* Mail Types */}
          <div className="mt-6 px-4 flex flex-col gap-2">
            <MailType
              title="Classic Mail"
              desc="Send personalized one-on-one messages with a traditional touch."
              emoji="📮"
            />
            <MailType
              title="Ghost Mail"
              desc="Deliver mysterious, time-limited, or secretive messages with a spooky flair."
              emoji="👻"
            />
            <MailType
              title="Bulk Mail"
              desc="Effortlessly distribute messages to a large audience at once."
              emoji="📢"
            />
          </div>

          {/* Subscribe */}
          <div className="px-4 mt-4">
            <button className="w-full bg-gray-100 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition">
              Subscribe
            </button>
          </div>
        </div>

        {/* Storage Info */}
        <div className="px-4 py-3 border-t text-sm text-blue-600">
          Your Email Space <span className="text-gray-600">0/3 GB</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white w-[96%] mx-auto rounded-xl mb-3 shadow px-4 py-3">
          {/* Left: Menu button for Mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-xl text-gray-600 hover:text-blue-600"
            >
              ☰
            </button>

            {/* Search */}
            <div className="flex items-center relative w-[12rem] sm:w-[20rem] md:w-[25rem]">
              <CiSearch className="absolute left-3" />
              <input
                type="text"
                placeholder="Search messages"
                value={search}
                onClick={clickfetchInboxEmails}
                onChange={handleSearchChange} // 👈 API runs on typing
                className="w-full pl-8 text-sm text-gray-500 bg-gray-100 rounded-md px-4 py-2 outline-none"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 ml-4">
            <img src="/icons/Frame 99245849.png" alt="" />
            <img src="/icons/setting-2.png" alt="" />
            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">
                  {emailData.localPart}
                </p>
                <p className="text-xs text-gray-500">{emailData.email}</p>
              </div>
              <button
                onClick={() => setShowProfile(true)}
                className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold"
              >
                {emailData.email[0].toUpperCase()}
              </button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white w-[96%] mx-auto rounded-xl shadow-sm text-sm">
          <div className="flex items-center gap-12">


            <input
              type="checkbox"
              checked={allSelected}       // ✅ derived from state
              onChange={toggleAll}        // ✅ toggle all
              className="appearance-none w-5 h-5 rounded border-2 border-gray-300 checked:bg-blue-600 focus:outline-none cursor-pointer"
            />


            {anySelected &&
              <div className="relative group">
                {/* Icon with hover bg */}
                <div className="p-2 rounded-full hover:bg-gray-300 cursor-pointer">
                  <LuTrash2 onClick={handleDelete} className="text-lg" />
                </div>

                {/* Tooltip */}
                <span className="absolute left-1/2 -translate-x-1/2 -top-7 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Delete
                </span>
              </div>}

          </div>
          {/* 🔵 Filter Buttons */}
          <div className="flex items-center py-2 font-medium">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-1 rounded-md ${filter === "all" ? "bg-gray-200" : "text-gray-600"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-2 py-1 rounded-md ${filter === "read" ? "bg-gray-200" : "text-gray-600"}`}
            >
              Read
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-2 py-1 rounded-md ${filter === "unread" ? "bg-gray-200" : "text-gray-600"}`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter("file")}
              className={`px-2 py-1 rounded-md ${filter === "file" ? "bg-gray-200" : "text-gray-600"}`}
            >
              Has File
            </button>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 flex items-center justify-center text-blue-600 text-lg">
          <Inbox ref={childRef} checked={checked} search={emails} filter={filter} setCountRead={setCountRead} selectedIds={selectedIds} toggleSingle={toggleSingle} />
        </div>


        {/* Compose Popup */}
        {showCompose && <ComposePopUp onClose={() => setShowCompose(false)} />}
      </main>
    </div>
  );
}

/* Sidebar Item */
function SidebarItem({ icon, text, active }) {
  return (
    <button
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${active ? "bg-white text-black font-medium" : "hover:bg-gray-100 text-gray-700"
        }`}
    >
      <span className={`text-lg ${active ? "text-blue-600" : "text-gray-700"}`}>
        {icon}
      </span>
      {text}
    </button>
  );
}

/* Mail Type Box */
function MailType({ title, desc, emoji }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition">
      <div className="text-2xl">{emoji}</div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-[0.52rem] font-bold text-black">{desc}</p>
      </div>
    </div>
  );
}
