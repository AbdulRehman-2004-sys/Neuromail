import { createContext, useState } from "react";

export const EmailContext = createContext();

export const EmailProvider = ({ children }) => {
  const [emailData, setEmailData] = useState({
    email: "",
    localPart: "",
    domainId: ""
  });
  console.log(emailData);
  const [emailDetail,setEmailDetail] = useState()
  const [replyMail,setReplyMail] = useState([])
  const [forwardMail,setForwardMail] = useState()
  const [bodyShow,setBodyShow] = useState({})
  return (
    <EmailContext.Provider value={{bodyShow,setBodyShow,setForwardMail,forwardMail,setReplyMail,replyMail, emailData, setEmailData,emailDetail,setEmailDetail }}>
      {children}
    </EmailContext.Provider>
  );
};
