import localFont from "next/font/local";

export const SpoqaHanSansNeo = localFont({
  src: [
    {
      path: "../../public/fonts/SpoqaHanSansNeo-Thin.woff2",
      weight: "100",
    },
    {
      path: "../../public/fonts/SpoqaHanSansNeo-Light.woff2",
      weight: "300",
    },
    {
      path: "../../public/fonts/SpoqaHanSansNeo-Regular.woff2",
      weight: "400",
    },
    {
      path: "../../public/fonts/SpoqaHanSansNeo-Medium.woff2",
      weight: "500",
    },
    {
      path: "../../public/fonts/SpoqaHanSansNeo-Bold.woff2",
      weight: "700",
    },
  ],
  display: "swap",
  variable: "--font-spoqa-han-sans-neo",
});
