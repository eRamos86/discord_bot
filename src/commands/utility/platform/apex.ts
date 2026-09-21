import type { Command } from '../../../types/command.types.js';
import * as apex from '../../../features/platform/apex/index.js';

const vehicle = {
    type: 'string' as const,
    required: true,
    description: 'Vehicle ID from /apex garage',
    maxLength: 64,
    autocomplete: true,
};

export default {
    name: 'apex',
    desc: 'Private vehicle, fuel and maintenance commands',
    prefix: { enabled: false },
    access: { private: true, nova: { project: 'apex' } },
    subcommands: {
        garage: {},
        vehicle: { args: { vehicle } },
        maintenance: { args: { vehicle } },
        builds: { args: { vehicle } },
        odometer: {
            args: { vehicle, miles: { type: 'integer', required: true, minValue: 0, maxValue: 10000000 } },
        },
        fuel: {
            args: {
                vehicle,
                odometer: { type: 'integer', required: true, minValue: 0, maxValue: 10000000 },
                gallons: { type: 'number', required: true, minValue: 0.01, maxValue: 999 },
                cost: { type: 'number', required: true, minValue: 0.01, maxValue: 99999 },
            },
        },
    },
    async autocomplete(interaction) {
        return apex.handleAutocomplete(interaction);
    },
    async execute(ctx) {
        const token = ctx.identity!.token;
        const action = ctx.getString('subcommand');
        const id = ctx.getString('vehicle') ?? '';

        if (action === 'garage') return apex.handleGarage(ctx, token);
        if (action === 'vehicle') return apex.handleVehicle(ctx, token, id);
        if (action === 'fuel') {
            return apex.handleFuel(ctx, token, {
                vehicleId: id,
                odometer: ctx.getNumber('odometer')!,
                volumeGallons: ctx.getNumber('gallons')!,
                totalCost: ctx.getNumber('cost')!,
            });
        }
        if (action === 'odometer') {
            return apex.handleOdometer(ctx, token, id, ctx.getNumber('miles')!);
        }
        if (action === 'maintenance') {
            return apex.handleMaintenance(ctx, token, id);
        }
        return apex.handleBuilds(ctx, token, id);
    },
} satisfies Command;
