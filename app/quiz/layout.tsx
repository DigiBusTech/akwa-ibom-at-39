import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Akwa Ibom @ 39 Trivia Quiz | Land of Promise",
  description:
    "Test your knowledge of Akwa Ibom State's 39-year heritage — cuisine, leadership, geography, and culture — to earn your official commemorative anniversary badge.",
  openGraph: {
    title: "Akwa Ibom @ 39 Trivia Quiz",
    description:
      "How well do you know the Land of Promise? Take the official Akwa Ibom @ 39 Anniversary Trivia and earn your badge.",
    type: "website",
  },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
