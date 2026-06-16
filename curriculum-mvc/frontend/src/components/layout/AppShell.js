// frontend/src/components/layout/AppShell.js
// Provides the outer shell: page transition wrapper.

import React, { useState, useEffect } from "react";

export function PageTransition({ id, children }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div key={id} className={`page-transition ${visible ? "page-visible" : ""}`}>
      {children}
    </div>
  );
}
