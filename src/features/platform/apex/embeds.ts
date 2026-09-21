import type { EmbedBuilder } from 'discord.js';
import { platformEmbed, formatCurrency, formatDate, truncate } from '../config.js';

/**
 * Renders the user's garage listing.
 */
export function garageEmbed(vehicles: Record<string, unknown>[]): EmbedBuilder {
    const embed = platformEmbed('apex', {
        title: '🏎️ Apex Garage',
        desc: vehicles.length === 0 ? 'No vehicles registered in your garage.' : undefined,
    });

    for (const v of vehicles.slice(0, 10)) {
        const name = String(v.name ?? 'Vehicle');
        const specs = [v.year, v.make, v.model].filter(Boolean).join(' ');
        const odo = Number(v.currentOdometer ?? 0).toLocaleString();
        embed.addFields({
            name: specs ? `${name} (${specs})` : name,
            value: `**Odometer:** ${odo} mi\n**ID:** \`${truncate(v.id, 36)}\``,
            inline: true,
        });
    }

    return embed;
}

/**
 * Renders details for a single vehicle.
 */
export function vehicleDetailEmbed(v: Record<string, unknown>): EmbedBuilder {
    const name = String(v.name ?? 'Vehicle');
    const specs = [v.year, v.make, v.model].filter(Boolean).join(' ');
    const odo = Number(v.currentOdometer ?? 0).toLocaleString();

    return platformEmbed('apex', {
        title: `🏎️ ${name}`,
        desc: specs || undefined,
        fields: [
            { name: 'Odometer', value: `${odo} mi`, inline: true },
            ...(v.vin ? [{ name: 'VIN', value: `\`${v.vin}\``, inline: true }] : []),
            ...(v.licensePlate ? [{ name: 'Plate', value: String(v.licensePlate), inline: true }] : []),
            { name: 'ID', value: `\`${v.id}\``, inline: false },
        ],
    });
}

/**
 * Renders fuel entry confirmation.
 */
export function fuelConfirmEmbed(entry: {
    vehicleId: string;
    odometer: number;
    volumeGallons: number;
    totalCost: number;
}): EmbedBuilder {
    const ppg = entry.volumeGallons > 0 ? (entry.totalCost / entry.volumeGallons).toFixed(3) : '—';
    return platformEmbed('apex', {
        title: '⛽ Fuel Log Recorded',
        fields: [
            { name: 'Volume', value: `${entry.volumeGallons.toFixed(2)} gal`, inline: true },
            { name: 'Total Cost', value: formatCurrency(entry.totalCost), inline: true },
            { name: 'Price/Gal', value: `$${ppg}`, inline: true },
            { name: 'Odometer', value: `${entry.odometer.toLocaleString()} mi`, inline: true },
            { name: 'Vehicle', value: `\`${entry.vehicleId}\``, inline: true },
        ],
    });
}

/**
 * Renders odometer update confirmation.
 */
export function odometerUpdateEmbed(vehicleId: string, miles: number): EmbedBuilder {
    return platformEmbed('apex', {
        title: '📈 Odometer Updated',
        fields: [
            { name: 'New Reading', value: `${miles.toLocaleString()} mi`, inline: true },
            { name: 'Vehicle', value: `\`${vehicleId}\``, inline: true },
        ],
    });
}

/**
 * Renders maintenance records.
 */
export function maintenanceEmbed(records: Record<string, unknown>[], _vehicleId: string): EmbedBuilder {
    const embed = platformEmbed('apex', {
        title: '🔧 Maintenance History',
        desc: records.length === 0 ? 'No maintenance records found.' : undefined,
    });

    for (const rec of records.slice(0, 10)) {
        const title = truncate(rec.title ?? rec.description ?? 'Service', 50);
        const date = formatDate(rec.date ?? rec.performedAt);
        const cost = rec.cost ? formatCurrency(rec.cost) : '—';
        embed.addFields({
            name: `${title} (${date})`,
            value: `**Cost:** ${cost}\n**Notes:** ${truncate(rec.notes ?? 'None', 100)}`,
            inline: false,
        });
    }

    return embed;
}

/**
 * Renders vehicle build / modifications.
 */
export function buildsEmbed(builds: Record<string, unknown>[], _vehicleId: string): EmbedBuilder {
    const embed = platformEmbed('apex', {
        title: '🛠️ Vehicle Builds & Mods',
        desc: builds.length === 0 ? 'No build records found.' : undefined,
    });

    for (const b of builds.slice(0, 10)) {
        const title = truncate(b.title ?? b.name ?? 'Build Part', 50);
        const type = String(b.type ?? b.category ?? 'Mod');
        const status = String(b.status ?? 'installed');
        const cost = b.cost ? formatCurrency(b.cost) : undefined;
        embed.addFields({
            name: `${title} [${type}]`,
            value: `**Status:** ${status}${cost ? ` · **Cost:** ${cost}` : ''}`,
            inline: true,
        });
    }

    return embed;
}
