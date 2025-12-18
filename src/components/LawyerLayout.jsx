import React from "react";
import LawyerNavbar from "./LawyerNavbar";
import "./LawyerLayout.css";

export default function LawyerLayout({ activeKey = "cases", bodyClassName = "", children }) {
  return (
    <div className="lawyer-layout">
      <LawyerNavbar activeKey={activeKey} />
      <main className={`lawyer-layout__body ${bodyClassName}`.trim()}>{children}</main>
    </div>
  );
}
