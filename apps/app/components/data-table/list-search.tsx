"use client";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@app/ui/components/input-group";
import { useSearchInput } from "@app/ui/hooks/use-search-input";
import Search from "@carbon/icons-react/es/Search";
import { useQueryStates } from "nuqs";
import { searchParsers } from "./list-search-params";

export function ListSearch({ placeholder }: { placeholder: string }) {
	const [{ q }, setState] = useQueryStates(searchParsers);

	return (
		<ListSearchInput
			committed={q}
			commit={(next) => setState({ q: next, page: 1 })}
			placeholder={placeholder}
		/>
	);
}

function ListSearchInput({
	committed,
	commit,
	placeholder,
}: {
	committed: string;
	commit: (value: string) => void;
	placeholder: string;
}) {
	const [value, setValue] = useSearchInput(committed, commit);

	return (
		<InputGroup className="w-full sm:w-64">
			<InputGroupAddon>
				<Search />
			</InputGroupAddon>
			<InputGroupInput
				placeholder={placeholder}
				value={value}
				onChange={(event) => setValue(event.target.value)}
				autoComplete="off"
			/>
		</InputGroup>
	);
}
