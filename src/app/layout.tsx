import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import Header from "@/components/Header";
import { SpeedInsights } from "@vercel/speed-insights/next";


export const metadata: Metadata = {
  title: "TSender",

};

export default function RootLayout(props: { children: ReactNode }) {

  return (
    <html lang="en">
      <body>
        <SpeedInsights />
        <Providers>
          <Header />
          {props.children}
        </Providers>
      </body>
    </html>
  );
}
