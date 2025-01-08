import { ThemeSwitcher } from "@/components/theme-switcher";
import { ThemeProvider } from "next-themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import localFont from "next/font/local";
import { Metadata } from "next";

const MontserratPrimary = localFont({
  src: "./fonts/Montserrat-Regular.ttf",
  variable: "--font-primary-regular",
  weight: "100 900",
});
const MontserratBold = localFont({
  src: "./fonts/Montserrat-Bold.ttf",
  variable: "--font-primary-bold",
  weight: "100 900",
});
const MontserratSemiBold = localFont({
  src: "./fonts/Montserrat-SemiBold.ttf",
  variable: "--font-primary-semibold",
  weight: "100 900",
});
const MontserratMedium = localFont({
  src: "./fonts/Montserrat-Medium.ttf",
  variable: "--font-primary-medium",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Parkify",
    default: "Parkify",
  },
  description: "The official Parkify website. Best Parking finder available.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${MontserratPrimary.variable} ${MontserratBold.variable}  ${MontserratSemiBold.variable} ${MontserratMedium.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex fixed right-4 top-4 z-10">
            <ThemeSwitcher />
            <ToastContainer />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
