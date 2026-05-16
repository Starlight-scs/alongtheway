'use client';

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

interface CalEmbedProps {
  calLink: string;
  accessCode: string;
}

export function CalEmbed({ calLink, accessCode }: CalEmbedProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "light",
        hideEventTypeDetails: false,
      });
    })();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <Cal
        calLink={calLink}
        style={{ width: "100%", height: "650px", overflow: "scroll" }}
        config={{
          metadata: JSON.stringify({ accessCode }),
        }}
      />
    </div>
  );
}
