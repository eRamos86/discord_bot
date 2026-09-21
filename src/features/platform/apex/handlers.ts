import type { AutocompleteInteraction } from 'discord.js';
import type { CommandContext } from '../../../framework/context/context.types.js';
import { array, record } from '../../../services/http.js';
import { platform } from '../../../services/platform.js';
import { requirePlatformAuth } from '../auth/index.js';
import {
    garageEmbed,
    vehicleDetailEmbed,
    fuelConfirmEmbed,
    odometerUpdateEmbed,
    maintenanceEmbed,
    buildsEmbed,
} from './embeds.js';

/**
 * Autocomplete handler for selecting a vehicle.
 */
export async function handleAutocomplete(interaction: AutocompleteInteraction) {
    try {
        const identity = await requirePlatformAuth(interaction, { project: 'apex' });
        const query = String(interaction.options.getFocused()).toLowerCase();
        const vehicles = await platform.apex.garage(identity.token);
        return interaction.respond(
            vehicles
                .filter(
                    (v) =>
                        typeof v.id === 'string' &&
                        `${v.name ?? ''} ${v.year ?? ''} ${v.make ?? ''} ${v.model ?? ''}`
                            .toLowerCase()
                            .includes(query),
                )
                .slice(0, 25)
                .map((v) => ({
                    name:
                        `${v.name ?? ''} ${v.year ?? ''} ${v.make ?? ''} ${v.model ?? ''}`
                            .trim()
                            .slice(0, 100) || String(v.id),
                    value: String(v.id),
                })),
        );
    } catch {
        return interaction.respond([]);
    }
}

/**
 * Handles garage listing.
 */
export async function handleGarage(ctx: CommandContext, token: string) {
    const vehicles = await platform.apex.garage(token);
    const embed = garageEmbed(vehicles);
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles single vehicle details.
 */
export async function handleVehicle(ctx: CommandContext, token: string, vehicleId: string) {
    const data = record(await platform.apex.vehicle(token, vehicleId));
    const embed = vehicleDetailEmbed(record(data.vehicle));
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles logging fuel entry.
 */
export async function handleFuel(
    ctx: CommandContext,
    token: string,
    input: { vehicleId: string; odometer: number; volumeGallons: number; totalCost: number },
) {
    await platform.apex.fuel(token, input);
    const embed = fuelConfirmEmbed(input);
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles updating odometer.
 */
export async function handleOdometer(ctx: CommandContext, token: string, vehicleId: string, miles: number) {
    await platform.apex.odometer(token, vehicleId, miles);
    const embed = odometerUpdateEmbed(vehicleId, miles);
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles maintenance history.
 */
export async function handleMaintenance(ctx: CommandContext, token: string, vehicleId: string) {
    const data = record(await platform.apex.maintenance(token, vehicleId));
    const records = Object.values(data).find(Array.isArray) ?? [];
    const embed = maintenanceEmbed(array(records), vehicleId);
    return ctx.reply({ embeds: [embed] });
}

/**
 * Handles builds listing.
 */
export async function handleBuilds(ctx: CommandContext, token: string, vehicleId: string) {
    const data = record(await platform.apex.builds(token, vehicleId));
    const records = Object.values(data).find(Array.isArray) ?? [];
    const embed = buildsEmbed(array(records), vehicleId);
    return ctx.reply({ embeds: [embed] });
}
