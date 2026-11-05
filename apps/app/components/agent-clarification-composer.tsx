"use client";

import { AsyncButtonContent } from "@app/ui/components/async-action";
import { CHAT_COMPOSER_SURFACE_CLASS_NAME } from "@app/ui/components/chat-composer";
import {
	Questionnaire,
	QuestionnaireActions,
	QuestionnaireChoice,
	QuestionnaireChoices,
	QuestionnaireDescription,
	QuestionnaireError,
	QuestionnaireInput,
	QuestionnaireItem,
	QuestionnaireSubmit,
	QuestionnaireTitle,
} from "@app/ui/components/questionnaire";
import type { EveMessageInputRequest } from "eve/react";
import { type FormEvent, useState } from "react";

const OPTION_VALUE_PREFIX = "option:";

export type ClarificationResponse =
	| { requestId: string; optionId: string; text?: never }
	| { requestId: string; optionId?: never; text: string };

export function AgentClarificationComposer({
	question,
	pending,
	blockedReason,
	onSubmit,
}: {
	question: EveMessageInputRequest;
	pending: boolean;
	/** Set when the answer cannot be processed here: the controls lock and say why. */
	blockedReason?: string | null;
	onSubmit: (response: ClarificationResponse) => Promise<void>;
}) {
	const locked = pending || Boolean(blockedReason);
	const options = question.options ?? [];
	const [transportError, setTransportError] = useState<string | null>(null);
	const showFreeform =
		question.display === "text" ||
		question.allowFreeform === true ||
		options.length === 0;
	const items = [
		{
			name: "response",
			required: true,
			choices: options.map((option) => ({
				disabled: locked,
				value: `${OPTION_VALUE_PREFIX}${option.id}`,
			})),
		},
	];

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (locked) return;
		const value = String(
			new FormData(event.currentTarget).get("response") ?? "",
		).trim();
		if (!value) return;
		const optionId = value.startsWith(OPTION_VALUE_PREFIX)
			? value.slice(OPTION_VALUE_PREFIX.length)
			: null;
		const selectedOption = options.find((option) => option.id === optionId);
		setTransportError(null);
		try {
			const response = (
				selectedOption
					? { requestId: question.requestId, optionId: selectedOption.id }
					: { requestId: question.requestId, text: value }
			) satisfies ClarificationResponse;
			await onSubmit(response);
		} catch (error) {
			setTransportError(
				error instanceof Error && error.message.trim()
					? error.message
					: "Unable to submit. Check your connection and try again.",
			);
		}
	};

	return (
		<Questionnaire
			className={CHAT_COMPOSER_SURFACE_CLASS_NAME}
			defaultItem="response"
			items={items}
			shortcuts="letters"
			onSubmit={(event) => void submit(event)}
		>
			<QuestionnaireItem name="response" required>
				<QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
				<QuestionnaireDescription>
					{options.length > 0
						? "Choose an answer, then submit."
						: "Add the detail the agent needs to continue."}
				</QuestionnaireDescription>
				<QuestionnaireChoices>
					{options.map((option) => (
						<QuestionnaireChoice
							key={option.id}
							value={`${OPTION_VALUE_PREFIX}${option.id}`}
							disabled={locked}
						>
							<span className="font-medium">{option.label}</span>
							{option.description ? (
								<span className="text-muted-foreground">
									{option.description}
								</span>
							) : null}
						</QuestionnaireChoice>
					))}
					{showFreeform ? (
						<QuestionnaireInput
							aria-label={options.length > 0 ? "Another answer" : "Your answer"}
							placeholder="Add the detail the agent needs"
							disabled={locked}
						/>
					) : null}
				</QuestionnaireChoices>
				<QuestionnaireError />
			</QuestionnaireItem>
			{blockedReason ? (
				<p role="note" className="text-muted-foreground text-xs leading-5">
					{blockedReason}
				</p>
			) : null}
			{transportError ? (
				<p role="alert" className="text-destructive text-xs">
					{transportError}
				</p>
			) : null}
			<QuestionnaireActions>
				<QuestionnaireSubmit disabled={locked} aria-busy={pending} size="sm">
					<AsyncButtonContent
						status={pending ? "pending" : "idle"}
						pendingLabel="Submitting"
					>
						Submit answer
					</AsyncButtonContent>
				</QuestionnaireSubmit>
			</QuestionnaireActions>
		</Questionnaire>
	);
}
