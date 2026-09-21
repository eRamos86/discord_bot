import type { ArgumentDefinition, Command } from '../../types/command.types.js';
import { requireValue } from '../runtime/errors.js';
export function validateArguments(command: Command, args: Record<string, unknown>) {
    let schema = command.args ?? {};
    if (command.subcommands) {
        const sub = typeof args.subcommand === 'string' ? command.subcommands[args.subcommand] : undefined;
        requireValue(sub, `Choose a subcommand: ${Object.keys(command.subcommands).join(', ')}.`);
        schema = sub.args ?? {};
    }
    for (const [name, definition] of Object.entries(schema)) validateArgument(name, definition, args[name]);
}
function validateArgument(name: string, d: ArgumentDefinition, value: unknown) {
    if (value === undefined || value === null) {
        requireValue(!d.required, `Missing required argument: ${name}.`);
        return;
    }
    if (d.type === 'string') {
        requireValue(typeof value === 'string', `${name} must be text.`);
        requireValue(
            value.length >= (d.minLength ?? 0) && value.length <= (d.maxLength ?? 2000),
            `${name} has an invalid length.`,
        );
    }
    if (d.type === 'number' || d.type === 'integer') {
        requireValue(typeof value === 'number' && Number.isFinite(value), `${name} must be a finite number.`);
        if (d.type === 'integer')
            requireValue(Number.isSafeInteger(value), `${name} must be a whole number.`);
        requireValue(
            value >= (d.minValue ?? -Number.MAX_SAFE_INTEGER) &&
                value <= (d.maxValue ?? Number.MAX_SAFE_INTEGER),
            `${name} is outside the permitted range.`,
        );
    }
    if (d.type === 'boolean') requireValue(typeof value === 'boolean', `${name} must be true or false.`);
    if (d.choices)
        requireValue(
            d.choices.some((c) => c.value === value),
            `Invalid choice for ${name}.`,
        );
}
