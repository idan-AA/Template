import "@app/ui/globals.css";
import { Toaster } from "@app/ui/components/sonner";
import { TooltipProvider } from "@app/ui/components/tooltip";
import { cn } from "@app/ui/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { LocalDateTimeHydrator } from "@/components/local-date-time";
import { ThemeProvider } from "@/components/theme-provider";
import { getBrand } from "@/lib/brand";
import { brandCss, metadataOf } from "@/lib/brand-core";
import { TRPCReactProvider } from "@/lib/trpc/client";

const fontSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const fontMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export function generateMetadata(): Metadata {
	return metadataOf(getBrand());
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(fontSans.variable, fontMono.variable, "h-full antialiased")}
		>
			<head>
				{/* The client's brand colour; globals.css keeps the default. */}
				<style>{brandCss(getBrand().primaryColor)}</style>
			</head>
			<body className="flex min-h-full flex-col font-sans">
				<NuqsAdapter>
					<TRPCReactProvider>
						<ThemeProvider>
							<TooltipProvider>{children}</TooltipProvider>
							<Toaster richColors />
						</ThemeProvider>
					</TRPCReactProvider>
				</NuqsAdapter>
				<LocalDateTimeHydrator />
			</body>
		</html>
	);
}
