import { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | JobFlow Blog",
        default: "Job Search Tips & Insights | JobFlow Blog",
    },
    description: "Expert advice on job hunting, application tracking, interview preparation, and landing your dream job.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return children;
}
