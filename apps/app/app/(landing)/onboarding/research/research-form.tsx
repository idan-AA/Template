"use client";

import { CONTEXT_DEV_SIGNUP_URL } from "@app/db/settings";
import { Button } from "@app/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@app/ui/components/field";
import { Input } from "@app/ui/components/input";
import { Spinner } from "@app/ui/components/spinner";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";

export function ResearchForm() {
	const trpc = useTRPC();
	const router = useRouter();

	const keyId = useId();

	const save = useMutation(
		trpc.settings.setResearchKey.mutationOptions({
			onSuccess: () => {
				router.refresh();
				router.replace("/");
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				const form = new FormData(event.currentTarget);
				const apiKey = String(form.get("apiKey") ?? "").trim();

				if (!apiKey) return router.replace("/");

				save.mutate({ apiKey });
			}}
			className="flex flex-col gap-6"
		>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor={keyId}>Context API key</FieldLabel>
					<Input
						id={keyId}
						name="apiKey"
						type="password"
						placeholder="Paste the key"
						autoComplete="off"
						autoCapitalize="off"
						autoCorrect="off"
						spellCheck={false}
						autoFocus
					/>
					<FieldDescription>
						Optional. You can add it later in Settings. Don't have a key?{" "}
						<a
							href={CONTEXT_DEV_SIGNUP_URL}
							target="_blank"
							rel="noreferrer"
							className="underline underline-offset-4 hover:text-foreground"
						>
							Sign up here
						</a>
					</FieldDescription>
				</Field>
			</FieldGroup>

			<Button type="submit" disabled={save.isPending}>
				{save.isPending ? <Spinner data-icon="inline-start" /> : null}
				Save key and continue
			</Button>

			<Button
				type="button"
				variant="ghost"
				disabled={save.isPending}
				onClick={() => router.replace("/")}
			>
				Skip for now
			</Button>
		</form>
	);
}
