/** No 0/O, 1/l/I or other look-alikes: it gets read out and typed from a message. */
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/**
 * A temporary password an admin can pass on: four groups of four, like
 * `k3tm-9dwq-xp7e-hn4c`. 16 characters from 31 is about 79 bits, and well over
 * the ten-character minimum.
 */
export function generatePassword(
	random: (length: number) => Uint8Array = (length) =>
		crypto.getRandomValues(new Uint8Array(length)),
): string {
	const groups: string[] = [];

	for (let group = 0; group < 4; group++) {
		let text = "";
		// Reject bytes that would make some letters likelier than others.
		while (text.length < 4) {
			for (const byte of random(8)) {
				if (byte < 248 && text.length < 4) {
					text += ALPHABET[byte % ALPHABET.length];
				}
			}
		}
		groups.push(text);
	}

	return groups.join("-");
}
